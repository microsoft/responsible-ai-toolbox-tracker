# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.
#!/bin/bash

python3 save_model_torch.py bin
python3 save_model_torch.py mult
python3 save_model_torch.py reg
python3 save_model_torch.py frmt
python3 save_model_torch.py error
python3 save_model_torch_light.py
python3 save_model_tf.py bin 0
python3 save_model_tf.py mult 0
python3 save_model_tf.py mult 1
python3 save_model_tf.py reg 0
python3 convert_datasets_to_txt.py
python3 train_sklearn_estimator.py