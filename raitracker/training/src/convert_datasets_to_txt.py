# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.
import os
import numpy as np
import pandas as pd

org_data_fld = "../outputs/datasets/"
new_data_fld = "../outputs/datasets_alt/"

os.makedirs(new_data_fld, exist_ok=True)

content_list = os.listdir(org_data_fld)
for content in content_list:
    if content.lower().endswith('.csv'):
        file_name = new_data_fld + content[:-4]
        df = pd.read_csv(org_data_fld + content)
        np.savetxt(file_name + '.txt', df, delimiter='\t')