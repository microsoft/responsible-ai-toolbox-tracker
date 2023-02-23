# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.
import torch
from torch.nn import functional as F
import torch.nn as nn
import pytorch_lightning as pl


class LightningModel(pl.LightningModule):
    def __init__(self, input_dim: int, out_dim: int):
        super().__init__()
        self.input_dim = input_dim
        self.out_dim = out_dim
        self.l1 = nn.Linear(self.input_dim, 32)
        self.l2 = nn.Linear(32, 64)
        self.l3 = nn.Linear(64, 256)
        self.l4 = nn.Linear(256, 512)
        self.l5 = nn.Linear(512, 256)
        self.l6 = nn.Linear(256, 64)
        self.l7 = nn.Linear(64, self.out_dim)
        self.act = nn.ReLU()
        self.last_act = nn.Softmax()

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

    def training_step(self, batch, batch_idx):
        x, y = batch
        logits = self(x)
        one_hot_enc = nn.functional.one_hot(y.long(), num_classes=self.out_dim)
        one_hot_enc = one_hot_enc.float()
        loss = F.cross_entropy(logits, one_hot_enc)
        return loss

    def configure_optimizers(self):
        return torch.optim.Adam(self.parameters(), lr=0.02)