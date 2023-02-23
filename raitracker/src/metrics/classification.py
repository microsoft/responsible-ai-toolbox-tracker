# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.
from typing import Union
import warnings
import numpy as np
from sklearn.metrics import (
    roc_auc_score,
    precision_recall_fscore_support,
    accuracy_score,
    log_loss
)
from sklearn.preprocessing import OrdinalEncoder
from .utils import MetricNames

# -----------------------------------
def _encode_label(y: Union[np.ndarray, list]):
    y_encoded = np.expand_dims(y, axis=1)
    encoder = OrdinalEncoder()
    encoder.fit(y_encoded)
    y_encoded = encoder.transform(y_encoded)
    return y_encoded


# -----------------------------------
def _fix_y_true(y: Union[np.ndarray, list]):
    try:
        _ = y.astype(np.float64)
    except:
        y = _encode_label(y)
    return y


# ----------------------------------------
def _get_auc_metric(
    y: Union[np.ndarray, list], y_pred: Union[np.ndarray, list], average=None):
    # Binary classification
    if y_pred.shape[1] <= 2:
        if y_pred.shape[1] == 1:
            y_pred = y_pred[:, 0]
        else:
            y_pred = y_pred[:, 1]
        multi_class = "raise"
    # Multi-class
    else:
        multi_class = "ovr"

    try:
        roc_auc = roc_auc_score(y, y_pred, average=average, multi_class=multi_class)
    except:
        roc_auc = MetricNames.DEFAULT_VALUE

    return roc_auc


# -----------------------------------
def _get_log_loss(y: Union[np.ndarray, list], y_pred: Union[np.ndarray, list]):
    y_pred_float = y_pred.astype(np.float64)
    y = y.astype(np.float64)

    try:
        loss = log_loss(y, y_pred_float)
    except:
        loss = MetricNames.DEFAULT_VALUE

    return loss


# -----------------------------------
def _probability_to_class_binary(prediction: Union[np.ndarray, list], th: float):
    classes = []
    if prediction.shape[1] == 1:
        prediction = prediction[:, 0]
    else:
        prediction = prediction[:, 1]

    for p in prediction:
        c = 0
        if p >= th:
            c = 1
        classes.append(c)
    return classes


# -----------------------------------
def _probability_to_class_multi(prediction: Union[np.ndarray, list]):
    new_pred = prediction.argmax(axis=1)
    return new_pred


# -----------------------------------
def _probability_to_class(prediction: Union[np.ndarray, list]):
    if prediction.shape[1] > 2:
        return _probability_to_class_multi(prediction)
    return _probability_to_class_binary(prediction, 0.5)


# -----------------------------------
def _get_precision_recall_fscore(
    y: Union[np.ndarray, list], y_pred: Union[np.ndarray, list], average=None
):
    with warnings.catch_warnings(record=True) as caught_warnings:
        precision, recall, f1, sup = precision_recall_fscore_support(
            y, y_pred, average=average
        )
        if len(caught_warnings) > 0:
            return (
                MetricNames.DEFAULT_VALUE,
                MetricNames.DEFAULT_VALUE,
                MetricNames.DEFAULT_VALUE,
            )
    return precision, recall, f1


# ----------------------------------------
def get_classification_metrics(
    y: Union[np.ndarray, list],
    y_pred: Union[np.ndarray, list],
    proba: bool = True,
):
    y = _fix_y_true(y)

    average = "binary"
    if np.unique(y).shape[0] > 2:
        average = "macro"

    if proba:
        roc_auc = _get_auc_metric(y, y_pred, "macro")
        loss = _get_log_loss(y, y_pred)
        y_pred = _probability_to_class(y_pred)

    precision, recall, f1 = _get_precision_recall_fscore(y, y_pred, average)
    acc = accuracy_score(y, y_pred)

    results = {
        MetricNames.ACC_KEY: acc,
        MetricNames.PREC_KEY: precision,
        MetricNames.RECALL_KEY: recall,
        MetricNames.F1_KEY: f1,
    }

    if proba:
        results[MetricNames.AUC_KEY] = roc_auc
        results[MetricNames.LOG_LOSS_KEY] = loss
    else:
        results[MetricNames.AUC_KEY] = MetricNames.DEFAULT_VALUE
        results[MetricNames.LOG_LOSS_KEY] = MetricNames.DEFAULT_VALUE

    return results
