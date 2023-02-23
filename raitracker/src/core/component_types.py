# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.
from enum import Enum

class MlPlatform(Enum):
    sklearn = 1
    pytorch = 2
    keras = 3
    tensorflow = 4