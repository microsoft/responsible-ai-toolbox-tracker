# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.
import os
import warnings
# isort: off
warnings.filterwarnings('ignore')
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
# isort: on

import time
import math
from abc import ABC, abstractmethod
import numpy as np
import pandas as pd
from sklearn.utils import shuffle
import tensorflow as tf
from tensorflow import keras
from keras.optimizers import Adam, schedules
from keras.utils import Sequence

from ..model import DeepLearningModel


# ************************************************************
# ************************************************************
# ************************************************************
class DataLoader(Sequence):
    # -----------------------------------
    def __init__(self, df: pd.DataFrame, label_col: str, batch_size: int):
        self.label_col = label_col
        if label_col is None:
            x = df
            self.x = np.array(x, dtype=np.float32)
        else:
            x = df.drop(columns=[label_col])
            y = df[label_col]
            self.x = np.array(x, dtype=np.float32)
            self.y = np.array(y, dtype=np.float32)
            self.y = np.expand_dims(self.y, 1)
        self.len = self.x.shape[0]
        self.batch_size = batch_size

    # -----------------------------------
    def __len__(self):
        return math.ceil(self.x.shape[0] / self.batch_size)

    # -----------------------------------
    def __getitem__(self, idx):
        start = idx * self.batch_size
        end = (idx + 1) * self.batch_size
        batch_x = self.x[start:end]
        if self.label_col is None:
            return batch_x

        batch_y = self.y[start:end]
        return batch_x, batch_y

    # -----------------------------------
    def on_epoch_end(self):
        seed = np.random.randint()
        self.x = shuffle(self.x, random_state=seed)
        self.y = shuffle(self.y, random_state=seed)


# ************************************************************
# ************************************************************
# ************************************************************
class TFModel(DeepLearningModel):

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
        super(TFModel, self).__init__(
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
    def _use_bin_flag(self):
        return False

    # -----------------------------------
    def _set_device(self):
        #tf.keras.backend.set_floatx('float32')
        if self.use_gpu:
            os.environ["CUDA_VISIBLE_DEVICES"]=str(self.gpu_id)
            physical_devices = tf.config.list_physical_devices('GPU')
            tf.config.experimental.set_memory_growth(physical_devices[0], True)
        else:
            os.environ["CUDA_VISIBLE_DEVICES"]="-1"


    # -----------------------------------
    def _save_model_framework_format(self, file_path: str):
        self.model.save(file_path)


    # -----------------------------------
    def load(self, file_path: str):
        keras.models.load_model(file_path)


    # -----------------------------------
    def _organize_data(self):
        self.train_loader = DataLoader(self.train_df, self.label_col, self.batch_size)
        self.validation_loader = DataLoader(self.val_df, self.label_col, self.batch_size)


    # -----------------------------------
    def _build_inference_loader(self, df: pd.DataFrame):
        data_loader = DataLoader(df, None, self.batch_size)
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
            self.loss = tf.keras.losses.MeanSquaredError()
        else:
            self.loss = tf.keras.losses.CategoricalCrossentropy(
                            from_logits=False,
                            label_smoothing=0.0,
                            axis=-1
                        )

    # -----------------------------------
    def _build_model(self):
        self._build_loss_function()
        if self.clip_norm is None:
            self.optimizer = Adam(self.learning_rate)
        else:
            self.optimizer = Adam(self.learning_rate, clipnorm=self.clip_norm)
        self.model = self._get_model_architecture()


    # -----------------------------------
    def _compute_loss(self, y_true, y_pred):
        start = time.time()
        if self.regression:
            loss = self.loss(y_true, y_pred)
            #print(f"{loss}")
        else:
            one_hot = tf.reshape(y_true, [-1])
            one_hot = tf.cast(one_hot, dtype=tf.int32)
            one_hot = tf.one_hot(one_hot, depth=self.out_dim)
            loss = self.loss(one_hot, y_pred)
            #print(f"{y_pred.shape} - {y_true.shape} ==> {loss}")
        end = time.time()
        self.loss_time += end-start

        return loss


    # -----------------------------------
    def _process_batch(self, x, y=None, train=True):
        with tf.GradientTape() as tape:
            start = time.time()
            pred = self.model(x, training=train)
            end = time.time()
            self.fwd_time += end - start

            loss = None
            if y is not None:
                loss = self._compute_loss(y, pred)
            #print(loss)

            if train:
                start = time.time()
                gradients = tape.gradient(loss, self.model.trainable_variables)
                self.optimizer.apply_gradients(zip(gradients, self.model.trainable_variables))
                end = time.time()
                self.opt_time += end - start

        return pred, loss


    # -----------------------------------
    def print_time(self):
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