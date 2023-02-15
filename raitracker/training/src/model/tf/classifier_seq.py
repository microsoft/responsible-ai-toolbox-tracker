import os
import warnings
# isort: off
warnings.filterwarnings('ignore')
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
# isort: on

from math import log2, ceil, floor
import numpy as np
import pandas as pd
import tensorflow as tf
import tensorflow.keras.layers as ly
from tensorflow.keras import Model
from tensorflow.keras.regularizers import Regularizer, L1, L2

from .tf_model import TFModel


# ************************************************************
# ************************************************************
# ************************************************************
class _TFClassifierSeq(Model):

    N_LAYERS = 5
    LAYER_GROWTH = 2

    # -----------------------------------
    def __init__(
        self,
        input_dim: int,
        out_dim: int,
        lambda_regul: float
    ):
        super(_TFClassifierSeq, self).__init__()
        self.regul = None
        if lambda_regul > 0:
            self.regul = L2(lambda_regul)

        self.input_dim = input_dim
        self.out_dim = out_dim

        self.n_layers = self.N_LAYERS
        self.layer_growth = self.LAYER_GROWTH

        self.initializer = tf.keras.initializers.GlorotUniform()

        self._build_network()


    # -----------------------------------
    def _get_dense_layer(self, out_dim: int):
        layer = ly.Dense(
                        out_dim,
                        activation='relu',
                        #kernel_regularizer=self.regul,
                        #kernel_initializer=self.initializer
                    )
        return layer


    # -----------------------------------
    def _build_layers(self):
        self.layer_list = []
        self.layer_list.append(ly.InputLayer(input_shape=(self.input_dim)))
        in_dim = self.input_dim
        out_dim = self.layer_growth * in_dim
        for _ in range(self.n_layers):
            #print(f"layer({in_dim}, {out_dim})")
            layer = self._get_dense_layer(out_dim)
            self.layer_list.append(layer)
            in_dim = out_dim
            out_dim *= self.layer_growth

        n_layer_remain = floor(log2(out_dim) - ceil( log2(self.out_dim) ))
        out_dim = ceil(in_dim / 2)
        for _ in range(n_layer_remain):
            #print(f"layer({in_dim}, {out_dim})")
            layer = self._get_dense_layer(out_dim)
            self.layer_list.append(layer)
            in_dim = out_dim
            out_dim = ceil(out_dim / 2)

        layer = self._get_dense_layer(self.out_dim)
        self.layer_list.append(layer)


    # -----------------------------------
    def _build_network(self):
        self._build_layers()
        layer = ly.Activation('softmax', name='output')
        self.layer_list.append(layer)
        self.network = tf.keras.Sequential(self.layer_list)


    # -----------------------------------
    def call(self, x):
        return self.network(x)


# ************************************************************
# ************************************************************
# ************************************************************
class TFClassifierSeq(TFModel):

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
    def _save_model_framework_format(self, file_path: str):
        tf.keras.models.save_model(self.model.network, file_path, save_format="h5")


    # -----------------------------------
    def _get_model_architecture(self):
        encoder = _TFClassifierSeq(
            input_dim=self.input_dim,
            out_dim=self.out_dim,
            lambda_regul=self.lambda_regul
        )
        encoder.network.compile(
            optimizer=self.optimizer,
            loss=self.loss,
        )
        return encoder
