# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.
from typing import Union
import numpy as np
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score,
)
from .utils import MetricNames


# ----------------------------------------
def get_regression_metrics(y: Union[np.ndarray, list], y_pred: Union[np.ndarray, list]):
    mse = mean_squared_error(y, y_pred, multioutput="uniform_average")
    rmse = np.sqrt(mse)
    mae = mean_absolute_error(y, y_pred, multioutput="uniform_average")
    r2 = r2_score(y, y_pred, multioutput="uniform_average")

    results = {
        MetricNames.MSE_KEY: mse,
        MetricNames.RMSE_KEY: rmse,
        MetricNames.MAE_KEY: mae,
        MetricNames.R2_KEY: r2,
    }

    return results
