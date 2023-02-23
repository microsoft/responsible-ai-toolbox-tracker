# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.
import os
import json
import pandas as pd
from pathlib import Path
# -----------------------------------
class DataType:
    csv = "csv"
    txt = "txt"
    json = "json"

    all_types = [csv, txt]


# -----------------------------------
def load_data(path: str, project_path: str, separator: str = ',', header: bool = True):
    try:
        file_path = Path(path)
        _path = os.path.join(project_path, file_path)
        if path.lower().endswith(".csv"):
            return load_csv_text_file(_path, separator, header), DataType.csv
        elif path.lower().endswith(".json"):
            return load_json_file(_path), DataType.json
        elif path.lower().endswith(".txt"):
            return load_csv_text_file(_path, separator, header), DataType.txt
        else:
            raise ValueError(
                f"The test dataset file format is not supported. Supported formats: {DataType.all_types}."
            )
    except Exception as e:
        raise Exception(e)

# -----------------------------------


def load_csv_text_file(path: str, separator: str, header: bool):
    if header:
        df = pd.read_csv(path, sep=separator, header=0)
    else:
        df = pd.read_csv(path, sep=separator, header=None)
    return df

# -----------------------------------


def load_json_file(path):
    with open(path) as json_data:
        data = json.load(json_data)
    return data

# -----------------------------------


def split_target(dataset, target, data_type):
    """
    Splits the test data according to its type. The supported data file formats: csv, text [tab separated].

    :dataset: a panda data frame for the text and csv formats.  A string array for the json format type.
    :target: the test dataset target column.

    :data_type: the supported data file formats: csv, text [tab separated]
    """
    try:
        if data_type in [DataType.csv, DataType.txt]:
            if dataset.empty:
                raise ValueError("ERROR: the dataset provided is empty.")
            # if the dataset has valid column names
            if type(dataset.columns[0]) == str:
                X = dataset.drop(columns=[target])
                y = dataset[target]
            # otherwise, used indices
            else:
                try:
                    target = int(target)
                except:
                    raise ValueError(
                        f"ERROR: the target column provided ({target}) must be an integer when the "
                        + "dataset has no column names"
                    )

                target = int(target)
                X = dataset.drop(dataset.columns[target], axis=1)
                y = dataset.iloc[:, target]
        elif data_type == DataType.json:
            target_index = dataset['labelIndex']
            _dataMatrix = pd.DataFrame(dataset['dataMatrix'], index=None, columns=dataset['features'])
            X = _dataMatrix.drop(_dataMatrix.columns[target_index], axis=1)
            y = _dataMatrix.iloc[:, target_index]
        return X, y
    except IndexError:
        raise IndexError('INDEX_NOT_FOUND')
