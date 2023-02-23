# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

import os
from pathlib import Path
from .core import MlPlatform
from .platforms import (
    ParametersJson,
    sklearn_model_register,
    pytorch_model_register,
    keras_model_register,
)
# -----------------------------------
def _log_and_get_results(param_dict: dict):
    if param_dict[ParametersJson.ml_platform].lower() == MlPlatform.sklearn.name:
        metrics = sklearn_model_register(param_dict)
    elif param_dict[ParametersJson.ml_platform].lower() == MlPlatform.pytorch.name:
        metrics = pytorch_model_register(param_dict)
    elif param_dict[ParametersJson.ml_platform].lower() in [MlPlatform.keras.name, MlPlatform.tensorflow.name]:
        metrics = keras_model_register(param_dict)
    else:
        metrics = None
    return metrics

# -----------------------------------
def process_request(request):
    param_dict = {}
    ROOT_DIR = os.getcwd()
    param_dict[ParametersJson.project_path] = Path(ROOT_DIR)
    param_dict[ParametersJson.artifact_dir] = "model"

    param_dict[ParametersJson.run_id] = str(request['run_id'])
    param_dict[ParametersJson.model_path] = str(request['model_path'])
    param_dict[ParametersJson.test_data_path] = str(request['test_data_path'])
    param_dict[ParametersJson.target] = str(request['test_data_target'])
    param_dict[ParametersJson.ml_platform] = str(request['ml_platform_selected'])
    param_dict[ParametersJson.regression] = int(request['regression'])
    param_dict[ParametersJson.header] = int(request['header'])
    sep = str(request['separator'])

    if sep == 'comma':
        sep = ','
    elif sep == 'tab':
        sep = ' '
    param_dict[ParametersJson.separator] = sep   
    metrics = _log_and_get_results(param_dict)

    return metrics


# -----------------------------------
def local_process_request(request):
    param_dict = {}
    ROOT_DIR = os.getcwd()
    param_dict[ParametersJson.project_path] = Path(ROOT_DIR).parent.resolve()
    param_dict[ParametersJson.artifact_dir] = "model"
    param_dict[ParametersJson.run_id] = str(request['run_id'])
    param_dict[ParametersJson.model_path] = str(request['model_path'])
    param_dict[ParametersJson.test_data_path] = str(request['test_data_path'])
    param_dict[ParametersJson.target] = str(request['test_data_target'])
    param_dict[ParametersJson.regression] = int(request['regression'])
    param_dict[ParametersJson.ml_platform] = str(request['ml_platform_selected'])
    param_dict[ParametersJson.separator] = str(request['separator'])
    param_dict[ParametersJson.header] = int(request['header'])
    metrics = _log_and_get_results(param_dict)
    return metrics