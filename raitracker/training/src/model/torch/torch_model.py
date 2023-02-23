# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.
import os, time
from abc import ABC, abstractmethod
import numpy as np
import torch
import pandas as pd
import torch.nn as nn
from torch import optim
from torch.utils.data import Dataset, DataLoader
import mlflow
import pickle

from ..model import DeepLearningModel
from .loss import RegulLoss


# ************************************************************
# ************************************************************
# ************************************************************
class DataBuilder(Dataset):
    # -----------------------------------
    def __init__(self, df: pd.DataFrame, label_col: str, device: torch.device):
        self.device = device
        self.label_col = label_col
        if label_col is None:
            x = df
            self.x = np.array(x, dtype=np.float32)
        else:
            x = df.drop(columns=[label_col])
            y = df[label_col]
            self.x = np.array(x, dtype=np.float32)
            self.y = np.array(y, dtype=np.float32)
        self.len = self.x.shape[0]
        self.time = 0

    # -----------------------------------
    def __getitem__(self, index):
        start = time.time()
        x = self.x[index]
        x = torch.from_numpy(x).to(self.device)
        if self.label_col is None:
            return x

        y = np.array(self.y[index])
        y = torch.from_numpy(y).to(self.device)
        end = time.time()
        self.time += end - start
        return x, y

    # -----------------------------------
    def __len__(self):
        return self.len


# ************************************************************
# ************************************************************
# ************************************************************
class TorchModel(DeepLearningModel):

    # -----------------------------------
    def __init__(
        self,
        train_df: pd.DataFrame,
        val_df: pd.DataFrame,
        label_col: str,
        regression: bool = False,
        load_file: str = None,
        learning_rate: float = 1e-4,
        lambda_regul: float = 1e-6,
        batch_size: int = 128,
        clip_norm: float = None,
        epochs: int = 100,
        use_gpu: bool = False,
        gpu_id: int = 0,
        summary_path: str = "../summary/",
        summary_name: str = "model/",
        validation_interval: int = 10,
    ):
        super().__init__(
            train_df=train_df,
            val_df=val_df,
            label_col=label_col,
            regression=regression,
            load_file=load_file,
            learning_rate=learning_rate,
            lambda_regul=lambda_regul,
            batch_size=batch_size,
            clip_norm=clip_norm,
            epochs=epochs,
            use_gpu=use_gpu,
            gpu_id=gpu_id,
            summary_path=summary_path,
            summary_name=summary_name,
            validation_interval=validation_interval
        )
        self.loss_time = 0
        self.opt_time = 0
        self.fwd_time = 0

    # -----------------------------------
    def _set_device(self):
        if self.use_gpu:
            os.environ["CUDA_VISIBLE_DEVICES"] = str(self.gpu_id)
            self.device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
        else:
            os.environ["CUDA_VISIBLE_DEVICES"] = "-1"
            self.device = torch.device("cpu")

    # -----------------------------------
    def save(self, folder: str, file: str = None, torch_script: bool = True):
        os.makedirs(folder, exist_ok=True)
        file_path = folder
        if file is not None:
            file_path = os.path.join(folder, file)
        self._save_model_framework_format(file_path, torch_script)

    # -----------------------------------
    def _save_model_framework_format(self, file_path: str, torch_script: bool = True):
        #torch.save(self.model.state_dict(), file_path)
        if torch_script:
            model_scripted = torch.jit.script(self.model)
            model_scripted.save(file_path)
        else:
            torch.save(self.model, file_path)

    # -----------------------------------
    def load(self, file_path: str, torch_script: bool = True):
        #self.model.load_state_dict( torch.load(file_path, map_location=self.device) )
        if torch_script:
            self.model = torch.jit.load(file_path, map_location=self.device)
        else:
            self.model = torch.load(file_path, map_location=self.device)

    # -----------------------------------
    def _organize_data(self):
        self.train_set = DataBuilder(self.train_df, self.label_col, self.device)
        self.train_loader = DataLoader(dataset=self.train_set, batch_size=self.batch_size, shuffle=True)
        self.validation_set = DataBuilder(self.val_df, self.label_col, self.device)
        self.validation_loader = DataLoader(dataset=self.validation_set, batch_size=self.batch_size, shuffle=False)

    # -----------------------------------
    def _build_inference_loader(self, df: pd.DataFrame):
        data_set = DataBuilder(df, None, self.device)
        data_loader = DataLoader(dataset=data_set, batch_size=self.batch_size, shuffle=False)
        return data_loader

    # -----------------------------------
    def _get_train_loader(self):
        return self.train_loader

    # -----------------------------------
    def _get_validation_loader(self):
        return self.validation_loader

    # -----------------------------------
    @abstractmethod
    def _get_model_architecture(self):
        pass

    # -----------------------------------
    def _build_loss_function(self):
        if self.regression:
            self.loss = nn.MSELoss()
        elif self.bin_task:
            self.loss = nn.BCEWithLogitsLoss()
        else:
            self.loss = nn.CrossEntropyLoss()
        self.criterion_regul = None
        if self.lambda_regul > 0.0:
            self.criterion_regul = RegulLoss(self.lambda_regul)

    # -----------------------------------
    def _build_model(self):
        self.model = self._get_model_architecture()
        self._build_loss_function()
        self.parameters = self.model.parameters()
        self.optimizer = optim.Adam(self.parameters, lr=self.learning_rate)
        self.model.to(device=self.device)

    # -----------------------------------
    def _compute_loss(self, y_true, y_pred):
        start = time.time()
        if self.regression:
            y_true = y_true[:, None].float()
            loss = self.loss(y_pred, y_true)
        elif self.bin_task:
            #print(y_pred[:5])
            y_true = y_true[:, None].float()
            loss = self.loss(y_pred, y_true)
        else:
            one_hot_enc = nn.functional.one_hot(y_true.long(), num_classes=self.out_dim)
            one_hot_enc = one_hot_enc.float()
            loss = self.loss(y_pred, one_hot_enc)

        if self.criterion_regul is not None:
            loss_reg = self.criterion_regul(self.model)
            loss += loss_reg

        end = time.time()
        self.loss_time += end-start

        return loss

    # -----------------------------------
    def _process_batch(self, x, y=None, train=True):
        if train:
            self.model.train()
        else:
            torch.no_grad()
            self.model.eval()

        start = time.time()
        pred = self.model(x)
        if type(pred) == tuple:
            pred = pred[0]
        end = time.time()
        self.fwd_time += end - start

        loss = None
        if y is not None:
            loss = self._compute_loss(y, pred)

        if train:
            start = time.time()
            loss.backward()
            if self.clip_norm is not None:
                nn.utils.clip_grad_norm_(self.model.parameters(), self.clip_norm)
            self.optimizer.step()
            self.optimizer.zero_grad(set_to_none=True)
            end = time.time()
            self.opt_time += end - start

        if y is not None:
            loss = loss.item()

        return pred.detach().numpy(), loss


    # -----------------------------------
    def _mlflow_log_model(self):
        model_scripted = torch.jit.script(self.model)
        mlflow.pytorch.log_model(model_scripted, artifact_path="pytorch-model")

    # -----------------------------------
    def print_time(self):
        print(f"Data: {self.train_set.time}s")
        print(f"Loss: {self.loss_time}s")
        print(f"Opt: {self.opt_time}s")
        print(f"Fwd: {self.fwd_time}s")

    # -----------------------------------
    def dummy(self):
        start = time.time()
        loader = self.train_loader
        for _, data in enumerate(loader):
            pass
        end = time.time()
        print(f"TIME: {end-start}")