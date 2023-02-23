# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.
import os
import shutil
import warnings

warnings.filterwarnings("ignore")
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"

import numpy as np
import tensorflow as tf
import mlflow


class SummaryClass:

    TRAIN = 0
    VALIDATION = 1

    # -------------------------------------------------------------------
    def __init__(self, path: str, summary_name: str, load: bool = False):
        if not load and os.path.exists(path):
            shutil.rmtree(path)
        os.makedirs(path, exist_ok=True)
        self.summary_name = summary_name
        self.writer_train = tf.summary.create_file_writer(path + "Train/")
        self.writer_val = tf.summary.create_file_writer(path + "Validation/")
        self.switch_train_mode()

    # -------------------------------------------------------------------
    def _reset(self):
        self.loss = []

    # -------------------------------------------------------------------
    def add_info(self, loss: float):
        self.loss.append(loss)

    # -------------------------------------------------------------------
    def switch_train_mode(self):
        self.mode = self.TRAIN
        self._reset()

    # -------------------------------------------------------------------
    def switch_validation_mode(self):
        self.mode = self.VALIDATION
        self._reset()

    # -------------------------------------------------------------------
    def write(self, count):
        writer = self.writer_train
        name = "train_"
        if self.mode == self.VALIDATION:
            name = "val_"
            writer = self.writer_val

        with writer.as_default():
            loss = np.mean(self.loss)
            print(f"Mean Loss = {loss}")
            tf.summary.scalar(self.summary_name + "Loss", float(loss), step=count)
            name += "loss"

        self._reset()

        mlflow.log_metric(key=name, value=float(loss), step=count)
