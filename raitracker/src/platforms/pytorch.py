# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.
import os
from pathlib import Path
import pandas as pd
import pickle
import mlflow

from .constants import ParametersJson
from ..dataset import load_data, split_target
from ..metrics import get_metrics_and_log_mlflow


# ----------------------------------
def pytorch_model_register(param_dict: dict):
    import torch
    run_id = param_dict[ParametersJson.run_id]
    model_path = param_dict[ParametersJson.model_path]
    test_data_path = param_dict[ParametersJson.test_data_path]
    target = param_dict[ParametersJson.target]
    regression = param_dict[ParametersJson.regression]
    separator = param_dict[ParametersJson.separator]
    header = param_dict[ParametersJson.header]
    artifact_dir = param_dict[ParametersJson.artifact_dir]
    project_path = param_dict[ParametersJson.project_path]

    test_data, data_type = load_data(test_data_path, project_path, separator, header)
    X_test, y_test = split_target(test_data, target, data_type)
    _path = Path(model_path)
    model_path = os.path.join(project_path, _path)

    try:
        with mlflow.start_run(run_id) as run:
            model = torch.jit.load(model_path)
            info = mlflow.pytorch.log_model(model, artifact_path=artifact_dir, pickle_module=pickle)
            model = mlflow.pyfunc.load_model(info.model_uri)
            pred = model.predict(X_test)
            results = get_metrics_and_log_mlflow(y_test, pred, regression=regression)
    except Exception as e:
        raise Exception(e)

    return results