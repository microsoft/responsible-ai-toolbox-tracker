# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.
from .core import MlPlatform
from .registration import process_request, local_process_request

__all__ = [
    "MlPlatform",
    "process_request",
    "local_process_request"
]