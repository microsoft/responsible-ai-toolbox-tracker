# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.
import os, shutil
import pytest
from flask import Flask
from pprint import pprint

from .constants import all_input_dicts, run_id, create_mlruns_fld
from ..src import local_process_request

app = Flask(__name__)
def test_register_model():

    create_mlruns_fld()
    cont = 0
    for request in all_input_dicts:
        print(cont)
        cont += 1
        if request["err_expected"]:
            with pytest.raises(Exception):
                with app.app_context():
                    metrics = local_process_request(request)
                    pprint(metrics)
        else:
            with app.app_context():
                metrics = local_process_request(request)
                pprint(metrics)

    if os.path.exists(".pt_tmp/"):
        shutil.rmtree(".pt_tmp/")
    if os.path.exists("mlruns/"):
        shutil.rmtree("mlruns/")
    if os.path.exists("model/"):
        shutil.rmtree("model/")