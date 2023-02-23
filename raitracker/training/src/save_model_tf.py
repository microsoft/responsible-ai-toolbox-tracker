# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.
import os, sys
import pandas as pd

from model import (
    TFClassifier,
    TFClassifierSeq,
    TFRegressor
)

BINARY = 'bin'
MULTICLASS = 'mult'
REGRESSION = 'reg'
ERROR = 'error'

MODEL = MULTICLASS
H5_FMT = False

if len(sys.argv) > 1:
    MODEL = sys.argv[1]
    H5_FMT = bool(int(sys.argv[2]))

n_class = 3
regression = False
if MODEL == BINARY:
    lr = 5e-4
    model_class = TFClassifier
    name = "bin"
    if H5_FMT:
        model_class = TFClassifierSeq
    n_class = 2
elif MODEL == MULTICLASS:
    lr = 5e-4
    model_class = TFClassifier
    name = "multi"
    if H5_FMT:
        model_class = TFClassifierSeq
elif MODEL == REGRESSION:
    lr = 5e-4
    model_class = TFRegressor
    name = "reg"
    regression = True
else:
    lr = 1e-3
    model_class = TFClassifier
    name = "multi_err"

dataset_fld = "../outputs/datasets/"
model_fld = "../outputs/models/tf/"
summary_fld = "../outputs/summary/tf/"
os.makedirs(dataset_fld, exist_ok=True)
os.makedirs(model_fld, exist_ok=True)
os.makedirs(summary_fld, exist_ok=True)

train_df = pd.read_csv(f"{dataset_fld}train_{name}.csv", header=0)
val_df = pd.read_csv(f"{dataset_fld}val_{name}.csv", header=0)
test_df = pd.read_csv(f"{dataset_fld}test_{name}.csv", header=0)
X_test = test_df.drop(columns=["label"])
y_test = test_df["label"]


if H5_FMT and (MODEL == BINARY or MODEL == MULTICLASS):
    name = "multi_h5"
    if MODEL == BINARY:
        name = "bin_h5"


estimator = model_class(
    train_df=train_df,
    val_df=val_df,
    regression=regression,
    label_col="label",
    learning_rate=lr,
    batch_size=32,
    epochs=30,
    clip_norm=None,
    lambda_regul=0.0,
    summary_path=summary_fld,
    summary_name=f"{name}_tf/",
    validation_interval=50,
)
estimator.train()
estimator.print_time()
if H5_FMT and (MODEL == BINARY or MODEL == MULTICLASS):
    estimator.save(model_fld, f"{name}.hp5")
else:
    estimator.save(f"{model_fld}{name}_tf/")

#pred = estimator.predict(X_test)
#for i in range(10):
#    print(f"{y_test[i]} - {pred[i]}")
#results = get_metrics_and_log_mlflow(y_test, pred, regression=regression)
#print(results)