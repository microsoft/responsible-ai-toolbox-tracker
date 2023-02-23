# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.
import os, sys
import pandas as pd
from toy_dataset import create_dummy_dataset, split_data
from model import (
    TorchClassifier,
    TorchClassifierMultOut,
    TorchRegression,
)


BINARY = 'bin'
MULTICLASS = 'mult'
REGRESSION = 'reg'
WRONG_FORMAT = 'frmt'
ERROR_OUTPUT = 'error'

MODEL = MULTICLASS

if len(sys.argv) > 1:
    MODEL = sys.argv[1]

n_class = 3
regression = False
script_frmt = True
if MODEL == BINARY:
    lr = 5e-4
    model_class = TorchClassifier
    n_class = 2
    name = "bin"
elif MODEL == MULTICLASS:
    lr = 5e-4
    model_class = TorchClassifier
    name = "multi"
elif MODEL == REGRESSION:
    lr = 1e-4
    model_class = TorchRegression
    name = "reg"
    regression = True
elif MODEL == WRONG_FORMAT:
    lr = 1e-4
    model_class = TorchClassifier
    name = "frmt"
    script_frmt = False
else:
    lr = 1e-3
    model_class = TorchClassifierMultOut
    name = "err_mult"

dataset_fld = "../outputs/datasets/"
model_fld = "../outputs/models/pytorch/"
summary_fld = "../outputs/summary/pytorch/"
os.makedirs(dataset_fld, exist_ok=True)
os.makedirs(model_fld, exist_ok=True)
os.makedirs(summary_fld, exist_ok=True)


df = create_dummy_dataset(
    samples=2000,
    n_features=3,
    n_num_num=0,
    n_cat_cat=0,
    n_cat_num=0,
    n_classes=n_class,
    regression=regression
)

train_df, test_df = split_data(df, label="label", test_size=0.1, full_df=True, regression=regression)
train_df, val_df = split_data(train_df, label="label", test_size=0.2, full_df=True, regression=regression)

train_df.to_csv(f"{dataset_fld}train_{name}.csv", index=False)
val_df.to_csv(f"{dataset_fld}val_{name}.csv", index=False)
test_df.to_csv(f"{dataset_fld}test_{name}.csv", index=False)



estimator = model_class(
    train_df=train_df,
    val_df=val_df,
    regression=regression,
    label_col="label",
    learning_rate=lr,
    batch_size=16,
    epochs=30,
    clip_norm=1.0,
    lambda_regul=0.0,
    summary_path=summary_fld,
    summary_name=f"{name}/",
    validation_interval=50,
)
estimator.train()
estimator.print_time()
estimator.save(model_fld, f"{name}.pth", script_frmt)

X_test = test_df.drop(columns=["label"])
pred = estimator.predict(X_test)