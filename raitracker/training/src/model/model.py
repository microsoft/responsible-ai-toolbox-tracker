# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.
import os
from abc import ABC, abstractmethod

import numpy as np
import pandas as pd
import mlflow

from .summary import SummaryClass

class DeepLearningModel(ABC):

    TRAIN = 0
    VALIDATION = 1
    INFERENCE = 2

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
        self.regression = regression
        self.train_df = train_df
        self.val_df = val_df
        self.load_weights = load_file is not None
        self.load_file = load_file
        self.batch_size = batch_size
        self.epochs = epochs
        self.learning_rate = learning_rate
        self.lambda_regul = lambda_regul
        self.clip_norm = clip_norm
        self.use_gpu = use_gpu
        self.gpu_id = gpu_id
        self.validation_interval = validation_interval
        self.current_epoch = 0
        self.last_write = 0
        self.mode = self.TRAIN
        self.label_col = label_col

        self._set_device()
        self._get_in_out_dim()
        self._organize_data()
        self._build_model()
        if self.load_weights:
            self.load(self.load_file)
        self.summary_path = os.path.join(summary_path, summary_name)
        self.summary = SummaryClass(self.summary_path, summary_name, self.load_weights)

    # -----------------------------------
    def _use_bin_flag(self):
        return True

    # -----------------------------------
    @abstractmethod
    def _set_device(self):
        pass

    # -----------------------------------
    @abstractmethod
    def _save_model_framework_format(self, file_path: str):
        pass

    # -----------------------------------
    def save(self, folder: str, file: str = None):
        os.makedirs(folder, exist_ok=True)
        file_path = folder
        if file is not None:
            file_path = os.path.join(folder, file)
        self._save_model_framework_format(file_path)

    # -----------------------------------
    @abstractmethod
    def load(self):
        pass

    # -----------------------------------
    def _get_in_out_dim(self):
        n_col = self.train_df.shape[1]
        # disconsider the label column
        self.input_dim = n_col - 1
        # get the number of unique labels
        if self.regression:
            self.out_dim = 1
        else:
            self.out_dim = self.train_df[self.label_col].nunique()
            self.bin_task = False
            if self.out_dim == 2 and self._use_bin_flag():
                self.out_dim = 1
                self.bin_task = True

    # -----------------------------------
    @abstractmethod
    def _organize_data(self):
        pass

    # -----------------------------------
    @abstractmethod
    def _build_inference_loader(self, df: pd.DataFrame):
        pass

    # -----------------------------------
    @abstractmethod
    def _get_train_loader(self):
        pass

    # -----------------------------------
    @abstractmethod
    def _get_validation_loader(self):
        pass

    # -----------------------------------
    @abstractmethod
    def _build_model(self):
        pass

    # -----------------------------------
    @abstractmethod
    def _process_batch(self, x, y=None, train=True):
        pass

    # -----------------------------------
    def _check_validation(self):
        self.current_epoch += 1
        if self.current_epoch - self.last_write >= self.validation_interval:
            self.mode = self.VALIDATION
            self.summary.switch_validation_mode()
            self.last_write = self.current_epoch

    # -----------------------------------
    def _validate_model(self):
        loader = self._get_validation_loader()
        for _, data in enumerate(loader):
            _, loss = self._process_batch(data[0], data[1], train=False)
            self.summary.add_info(loss)

        self.summary.write(self.current_epoch)

        self.mode = self.TRAIN
        self.summary.switch_train_mode()

    # -----------------------------------
    def train(self):
        with mlflow.start_run():
            loader = self._get_train_loader()
            for epoch in range(self.epochs):

                for _, data in enumerate(loader):
                    _, loss = self._process_batch(data[0], data[1], train=True)
                    self.summary.add_info(loss)

                self.summary.write(epoch)

                self._check_validation()
                if self.mode == self.VALIDATION:
                    self._validate_model()

            mlflow.log_artifacts(self.summary_path[:-1], artifact_path="events")
            self._mlflow_log_model()

    # -----------------------------------
    def predict(self, df: pd.DataFrame):
        loader = self._build_inference_loader(df)

        y_pred = None
        for _, data in enumerate(loader):
            out, _ = self._process_batch(data, train=False)
            if y_pred is None:
                y_pred = out
            else:
                y_pred = np.concatenate((y_pred, out), axis=0)

        return y_pred


    # -----------------------------------
    def _mlflow_log_model(self):
        pass