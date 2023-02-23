# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.
import os
import pandas as pd
import torch
import pytorch_lightning as pl
from torch.utils.data import DataLoader
import mlflow

from toy_dataset import create_dummy_dataset, split_data
from model import LightningModel, DataBuilder


dataset_fld = "../outputs/datasets/"
model_fld = "../outputs/models/pytorch/"
os.makedirs(dataset_fld, exist_ok=True)
os.makedirs(model_fld, exist_ok=True)

df = create_dummy_dataset(
    samples=2000,
    n_features=3,
    n_num_num=0,
    n_cat_cat=0,
    n_cat_num=0,
    n_classes=3,
    regression=False
)

train_df, test_df = split_data(df, label="label", test_size=0.1, full_df=True, regression=False)
train_df, val_df = split_data(train_df, label="label", test_size=0.2, full_df=True, regression=False)

train_df.to_csv(f"{dataset_fld}train_light.csv", index=False)
val_df.to_csv(f"{dataset_fld}val_light.csv", index=False)
test_df.to_csv(f"{dataset_fld}test_light.csv", index=False)

model = LightningModel(input_dim=3, out_dim=3)
device = torch.device("cpu")
train_loader = DataBuilder(train_df, label_col="label", device=device)
train_loader = DataLoader(train_loader, batch_size=256, shuffle=True)
trainer = pl.Trainer(limit_train_batches=100, min_epochs=10, max_epochs=30)
trainer.fit(model, train_loader)
model_scripted = torch.jit.script(model)
model_scripted.save(f"{model_fld}light_model.pth")
