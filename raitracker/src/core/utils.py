# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.
import os
from pathlib import Path
from ..dataset.load_data import load_data
import shutil
import stat

# ----------------------------------------------
def app_configs():
    ROOT_DIR = os.getcwd()
    PROJECT_PATH = Path(ROOT_DIR).resolve()
    CONFIGS_PATH = os.path.join("configs", "main.json")
    configs_data, _ = load_data(CONFIGS_PATH, PROJECT_PATH)
    return configs_data


# ----------------------------------------------
def base_path():
    return os.path.dirname(os.path.realpath(__file__))


# ----------------------------------------------
def local_path(path):
    return os.path.join(base_path(), path)


# ----------------------------------------------
def rm_dir_readonly(func, path, _):
    os.chmod(path, stat.S_IWRITE)
    func(path)


# ----------------------------------------------
def delete_project_resources(path):
    try:
        dir_name = os.path.basename(os.path.normpath(path))
        _path = os.path.join("workspace/workspace_archive", dir_name)
        # shutil.make_archive(_path, "zip", "", path)
        shutil.rmtree(path, ignore_errors=False, onerror=rm_dir_readonly)
        return True
    except Exception as e:
        error_message = "The delete project action can't be completed because  of the project artifacts is open in another program. The project has been disconnected from your RAI Tracker, and it will be removed the next time our cleaning process kicks in."
        print(f"{error_message} : {e}")        
        return False
