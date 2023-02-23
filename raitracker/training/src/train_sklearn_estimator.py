# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.
import os
import pickle
from matplotlib.pyplot import axis
import mlflow
import sklearn
import numpy as np
import pandas as pd
from pprint import pprint
from sklearn.linear_model import ElasticNet, LinearRegression, LogisticRegression
from mlflow.models.signature import infer_signature
from sklearn import datasets, svm
from sklearn.model_selection import GridSearchCV
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
import xgboost as xgb

from toy_dataset import split_data

SEED = 42

# -----------------------------------
def fit_save(model, X_train, y_train, pkl_file):
    model.fit(X_train, y_train)
    with open(pkl_file, 'wb') as file:
            pickle.dump(model, file)


# -----------------------------------

dataset_fld = "../outputs/datasets/"
fld = "../outputs/models/sklearn/"
os.makedirs(dataset_fld, exist_ok=True)
os.makedirs(fld, exist_ok=True)

train_df = pd.read_csv(f"{dataset_fld}train_multi.csv", header=0)
X_train = train_df.drop(columns=["label"])
y_train = train_df["label"]

# regression
model = ElasticNet()
fit_save(model, X_train, y_train, f"{fld}elastic.pkl")

# classification
parameters = {"kernel": ("linear", "rbf"), "C": [1, 10]}
svc = svm.SVC()
clf = GridSearchCV(svc, parameters)
fit_save(clf, X_train, y_train, f"{fld}grid_search.pkl")

# regression
model = LinearRegression()
fit_save(model, X_train, y_train, f"{fld}linear.pkl")

# classification
model = LogisticRegression()
fit_save(model, X_train, y_train, f"{fld}logistic.pkl")

# regression
pipe = Pipeline([("scaler", StandardScaler()), ("lr", LinearRegression())])
fit_save(pipe, X_train, y_train, f"{fld}pipeline.pkl")

# classification
model = xgb.XGBClassifier(
            objective="binary:logistic",
            learning_rate=0.1,
            n_estimators=30,
            max_depth=10,
            colsample_bytree=0.7,
            alpha=0.0,
            reg_lambda=10.0,
            nthreads=4,
            verbosity=0,
            use_label_encoder=False,
        )
fit_save(model, X_train, y_train, f"{fld}xgb.pkl")