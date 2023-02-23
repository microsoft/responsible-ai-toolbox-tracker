# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.
import mlflow
import numpy as np
import pandas as pd
from typing import Union
from .classification import get_classification_metrics
from .regression import get_regression_metrics


# ----------------------------------------
def _pred_to_numpy(pred: Union[np.ndarray, list, pd.DataFrame]):
    if type(pred) == pd.DataFrame:
        pred = pred.to_numpy()
    elif type(pred) == list:
        pred = np.array(pred)
    elif type(pred) != np.ndarray:
        raise ValueError(
            (
                "ERROR: The y_pred parameter passed to the get_metrics_and_log_mlflow() "
                "function must be a numpy array, a list, or a pandas dataframe. Instead, "
                f"got a value from type {type(pred)}."
            )
        )

    if len(pred.shape) == 1:
        pred = np.expand_dims(pred, 1)

    return pred


# ----------------------------------------
def get_metrics(
    y: Union[np.ndarray, list],
    y_pred: Union[np.ndarray, list, pd.DataFrame],
    regression: bool = False,
    proba: bool = True,
):
    y_pred = _pred_to_numpy(y_pred)

    if regression:
        results = get_regression_metrics(y, y_pred)
    else:
        results = get_classification_metrics(y, y_pred, proba)
    return results


# ----------------------------------------
def log_results_mlflow(results: dict):
    for key in results.keys():
        mlflow.log_metric(key=key, value=results[key])


# ----------------------------------------
def get_metrics_and_log_mlflow(
    y: Union[np.ndarray, list],
    y_pred: Union[np.ndarray, list, pd.DataFrame],
    regression: bool = False,
    proba: bool = True,
):
    results = get_metrics(y, y_pred, regression, proba)
    log_results_mlflow(results)
    return results
