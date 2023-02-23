# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.
from typing import List
from math import log2, ceil, floor
import pandas as pd
import torch
import torch.nn as nn

from .torch_model import TorchModel


# ************************************************************
# ************************************************************
# ************************************************************
#@torch.jit.script

class _TorchClassifier(nn.Module):

    # -----------------------------------
    def __init__(
        self,
        input_dim: int,
        out_dim: int,
    ):
        super(_TorchClassifier, self).__init__()
        self.input_dim = input_dim
        self.out_dim = out_dim
        self.bin_task = False
        if self.out_dim == 1:
            self.bin_task = True

        self.act = nn.ReLU()
        if self.bin_task:
            self.last_act = nn.Sigmoid()
        else:
            self.last_act = nn.Softmax()
        self.l1 = nn.Linear(self.input_dim, 32)
        self.l2 = nn.Linear(32, 64)
        self.l3 = nn.Linear(64, 256)
        self.l4 = nn.Linear(256, 512)
        self.l5 = nn.Linear(512, 256)
        self.l6 = nn.Linear(256, 64)
        self.l7 = nn.Linear(64, self.out_dim)

    # -----------------------------------
    def forward(self, x):
        out = self.act(self.l1(x))
        out = self.act(self.l2(out))
        out = self.act(self.l3(out))
        out = self.act(self.l4(out))
        out = self.act(self.l5(out))
        out = self.act(self.l6(out))
        out = self.l7(out)
        if not self.training:
            out = self.last_act(out)
        return out


# ************************************************************
# ************************************************************
# ************************************************************
class TorchClassifier(TorchModel):

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

    # -----------------------------------
    def _get_model_architecture(self):
        encoder = _TorchClassifier(input_dim=self.input_dim, out_dim=self.out_dim)
        return encoder
