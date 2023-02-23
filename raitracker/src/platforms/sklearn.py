# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.
import os
import joblib
import mlflow
import sklearn
import mlflow.sklearn
from pathlib import Path
import mlflow.models.model
from mlflow.models.signature import infer_signature
from .constants import ParametersJson
from ..dataset import load_data, split_target
from ..metrics import get_metrics_and_log_mlflow

# -----------------------------------
def load_sklearn_model(path):
    try:
        return joblib.load(path)
    except Exception as e:
        raise Exception(e)

# -----------------------------------
def sklearn_model_register(param_dict: dict):
    run_id = param_dict[ParametersJson.run_id]
    model_path = param_dict[ParametersJson.model_path]
    test_data_path = param_dict[ParametersJson.test_data_path]
    target = param_dict[ParametersJson.target]
    regression = param_dict[ParametersJson.regression]
    separator = param_dict[ParametersJson.separator]
    header = param_dict[ParametersJson.header]
    artifact_dir = param_dict[ParametersJson.artifact_dir]
    project_path = param_dict[ParametersJson.project_path]

    #todo: maybe store all hardcoded values in the artifacts folder and load them as needed.
    _prefix = "val_"
    _sklearn_req = f"scikit-learn=={sklearn.__version__}"

    # load test data.
    test_data, data_type = load_data(test_data_path, project_path, separator, header)

    # split test data.
    X_test, y_test = split_target(test_data, target, data_type)

    # model path.
    _path = Path(model_path)
    model_path = os.path.join(project_path, _path)
    
    with mlflow.start_run(run_id):
        try:
            #todo: identify a solution for uploading multiple files.
            model = load_sklearn_model(model_path)

            # mlFlow requires a signature to be generated for sklearn models, before it can load/instrument them.
            signature = infer_signature(X_test, model.predict(X_test))

            # log model using mlFlow.  All parameters are required.
            mlflow.sklearn.log_model(model, artifact_dir, signature=signature, pip_requirements=[_sklearn_req])

            prob = True
            if not regression and hasattr(model, "predict_proba"):
                y_pred = model.predict_proba(X_test)
            else:
                y_pred = model.predict(X_test)
                prob = False
            metrics = get_metrics_and_log_mlflow(y_test, y_pred, regression=regression, proba=prob)
            return metrics

        except Exception as e:
            raise Exception(e)