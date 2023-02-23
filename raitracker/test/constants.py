# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.
import os
from ..src import MlPlatform

run_id = "7ebee1f4b0dc4b31b5b3bfcf89524dad"

sklearn_pipe = {
    "run_id": run_id, "err_expected": False, "header": 1, "separator": ',',
    "model_path": "responsible-ai-toolbox-tracker/raitracker/training/outputs/models/sklearn/pipeline.pkl",
    "test_data_path": "responsible-ai-toolbox-tracker/raitracker/training/outputs/datasets/test_multi.csv",
    "test_data_target": "label", "regression": 1, "ml_platform_selected": MlPlatform.sklearn.name
}

sklearn_elastic = {
    "run_id": run_id, "err_expected": False, "header": 1, "separator": ',',
    "model_path": "responsible-ai-toolbox-tracker/raitracker/training/outputs/models/sklearn/elastic.pkl",
    "test_data_path": "responsible-ai-toolbox-tracker/raitracker/training/outputs/datasets/test_multi.csv",
    "test_data_target": "label", "regression": 1, "ml_platform_selected": MlPlatform.sklearn.name
}

sklearn_grid = {
    "run_id": run_id, "err_expected": False, "header": 1, "separator": ',',
    "model_path": "responsible-ai-toolbox-tracker/raitracker/training/outputs/models/sklearn/grid_search.pkl",
    "test_data_path": "responsible-ai-toolbox-tracker/raitracker/training/outputs/datasets/test_multi.csv",
    "test_data_target": "label", "regression": 0, "ml_platform_selected": MlPlatform.sklearn.name
}

sklearn_xgb = {
    "run_id": run_id, "err_expected": False, "header": 1, "separator": ',',
    "model_path": "responsible-ai-toolbox-tracker/raitracker/training/outputs/models/sklearn/xgb.pkl",
    "test_data_path": "responsible-ai-toolbox-tracker/raitracker/training/outputs/datasets/test_multi.csv",
    "test_data_target": "label", "regression": 0, "ml_platform_selected": MlPlatform.sklearn.name
}

sklearn_xgb_txt_err = {
    "run_id": run_id, "err_expected": True, "header": 0, "separator": '\t',
    "model_path": "responsible-ai-toolbox-tracker/raitracker/training/outputs/models/sklearn/xgb.pkl",
    "test_data_path": "responsible-ai-toolbox-tracker/raitracker/training/outputs/datasets_alt/test_multi.txt",
    "test_data_target": "label", "regression": 0, "ml_platform_selected": MlPlatform.sklearn.name
}

sklearn_grid_txt = {
    "run_id": run_id, "err_expected": False, "header": 0, "separator": '\t',
    "model_path": "responsible-ai-toolbox-tracker/raitracker/training/outputs/models/sklearn/grid_search.pkl",
    "test_data_path": "responsible-ai-toolbox-tracker/raitracker/training/outputs/datasets_alt/test_multi.txt",
    "test_data_target": 3, "regression": 0, "ml_platform_selected": MlPlatform.sklearn.name
}

sklearn_log = {
    "run_id": run_id, "err_expected": False, "header": 1, "separator": ',',
    "model_path": "responsible-ai-toolbox-tracker/raitracker/training/outputs/models/sklearn/logistic.pkl",
    "test_data_path": "responsible-ai-toolbox-tracker/raitracker/training/outputs/datasets/test_multi.csv",
    "test_data_target": "label", "regression": 0, "ml_platform_selected": MlPlatform.sklearn.name
}

sklearn_linear = {
    "run_id": run_id, "err_expected": False, "header": 1, "separator": ',',
    "model_path": "responsible-ai-toolbox-tracker/raitracker/training/outputs/models/sklearn/linear.pkl",
    "test_data_path": "responsible-ai-toolbox-tracker/raitracker/training/outputs/datasets/test_multi.csv",
    "test_data_target": "label", "regression": 1, "ml_platform_selected": MlPlatform.sklearn.name
}

torch_bin = {
    "run_id": run_id, "err_expected": False, "header": 1, "separator": ',',
    "model_path": "responsible-ai-toolbox-tracker/raitracker/training/outputs/models/pytorch/bin.pth",
    "test_data_path": "responsible-ai-toolbox-tracker/raitracker/training/outputs/datasets/test_bin.csv",
    "test_data_target": "label", "regression": 0, "ml_platform_selected": MlPlatform.pytorch.name
}

torch_mult = {
    "run_id": run_id, "err_expected": False, "header": 1, "separator": ',',
    "model_path": "responsible-ai-toolbox-tracker/raitracker/training/outputs/models/pytorch/multi.pth",
    "test_data_path": "responsible-ai-toolbox-tracker/raitracker/training/outputs/datasets/test_multi.csv",
    "test_data_target": "label", "regression": 0, "ml_platform_selected": MlPlatform.pytorch.name
}

torch_reg = {
    "run_id": run_id, "err_expected": False, "header": 1, "separator": ',',
    "model_path": "responsible-ai-toolbox-tracker/raitracker/training/outputs/models/pytorch/reg.pth",
    "test_data_path": "responsible-ai-toolbox-tracker/raitracker/training/outputs/datasets/test_reg.csv",
    "test_data_target": "label", "regression": 1, "ml_platform_selected": MlPlatform.pytorch.name
}

torch_frmt_error = {
    "run_id": run_id, "err_expected": True, "header": 1, "separator": ',',
    "model_path": "responsible-ai-toolbox-tracker/raitracker/training/outputs/models/pytorch/frmt.pth",
    "test_data_path": "responsible-ai-toolbox-tracker/raitracker/training/outputs/datasets/test_frmt.csv",
    "test_data_target": "label", "regression": 0, "ml_platform_selected": MlPlatform.pytorch.name
}

torch_out_error = {
    "run_id": run_id, "err_expected": True, "header": 1, "separator": ',',
    "model_path": "responsible-ai-toolbox-tracker/raitracker/training/outputs/models/pytorch/err_mult.pth",
    "test_data_path": "responsible-ai-toolbox-tracker/raitracker/training/outputs/datasets/test_err_mult.csv",
    "test_data_target": "label", "regression": 0, "ml_platform_selected": MlPlatform.pytorch.name
}

torch_light = {
    "run_id": run_id, "err_expected": False, "header": 1, "separator": ',',
    "model_path": "responsible-ai-toolbox-tracker/raitracker/training/outputs/models/pytorch/light_model.pth",
    "test_data_path": "responsible-ai-toolbox-tracker/raitracker/training/outputs/datasets/test_light.csv",
    "test_data_target": "label", "regression": 0, "ml_platform_selected": MlPlatform.pytorch.name
}

keras_bin_fld = {
    "run_id": run_id, "err_expected": False, "header": 1, "separator": ',',
    "model_path": "responsible-ai-toolbox-tracker/raitracker/training/outputs/models/tf/bin_tf",
    "test_data_path": "responsible-ai-toolbox-tracker/raitracker/training/outputs/datasets/test_bin.csv",
    "test_data_target": "label", "regression": 0, "ml_platform_selected": MlPlatform.keras.name
}

keras_mult_fld = {
    "run_id": run_id, "err_expected": False, "header": 1, "separator": ',',
    "model_path": "responsible-ai-toolbox-tracker/raitracker/training/outputs/models/tf/multi_tf",
    "test_data_path": "responsible-ai-toolbox-tracker/raitracker/training/outputs/datasets/test_multi.csv",
    "test_data_target": "label", "regression": 0, "ml_platform_selected": MlPlatform.keras.name
}

keras_reg = {
    "run_id": run_id, "err_expected": False, "header": 1, "separator": ',',
    "model_path": "responsible-ai-toolbox-tracker/raitracker/training/outputs/models/tf/reg_tf",
    "test_data_path": "responsible-ai-toolbox-tracker/raitracker/training/outputs/datasets/test_reg.csv",
    "test_data_target": "label", "regression": 1, "ml_platform_selected": MlPlatform.keras.name
}

keras_mult_h5 = keras_mult_fld.copy()
keras_mult_h5["model_path"] = "responsible-ai-toolbox-tracker/raitracker/training/outputs/models/tf/multi_h5.hp5"

all_input_dicts = [
    sklearn_pipe,
    sklearn_elastic,
    sklearn_grid,
    sklearn_xgb,
    sklearn_xgb_txt_err,
    sklearn_grid_txt,
    sklearn_log,
    sklearn_linear,
    torch_bin,
    torch_mult,
    torch_reg,
    torch_frmt_error,
    torch_out_error,
    torch_light,
    keras_bin_fld,
    keras_mult_fld,
    keras_reg,
    keras_mult_h5,
]


def create_mlruns_fld():
    curr_dir = os.path.dirname(os.path.realpath(__file__))
    meta_file = (
        f"artifact_location: {curr_dir}/mlruns/0\n"
        "experiment_id: '0'\n"
        "lifecycle_stage: active\n"
        "name: Default\n"
    )
    os.makedirs(f"mlruns/0/{run_id}", exist_ok=True)
    with open("mlruns/0/meta.yaml", 'w') as f:
        f.write(meta_file)

    meta_file = (
        f"artifact_location: {curr_dir}/mlruns/0/{run_id}/artifacts\n"
        "entry_point_name: ''\n"
        "experiment_id: '0'\n"
        "lifecycle_stage: active\n"
        "name: ''\n"
        f"run_id: {run_id}\n"
        f"run_uuid: {run_id}\n"
        "source_name: ''\n"
        "source_type: 4\n"
        "source_version: ''\n"
        "end_time: 1664294106395\n"
        "user_id: unknown\n"
        "start_time: 1660320184039"
    )
    with open(f"mlruns/0/{run_id}/meta.yaml", 'w') as f:
        f.write(meta_file)