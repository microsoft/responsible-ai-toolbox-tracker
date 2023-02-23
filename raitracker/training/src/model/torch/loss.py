# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.
import torch
import torch.nn as nn


# --------------------------------------
class RegulLoss(nn.Module):
    def __init__(self, regul_lambda):
        super(RegulLoss, self).__init__()
        self.regul_lambda = regul_lambda

    def forward(self, model):
        reg = torch.tensor(0.0, requires_grad=True)
        for name, param in model.named_parameters():
            if "weight" in name:
                reg = reg + torch.norm(param)

        return self.regul_lambda * reg
