import random
import pytest
import numpy as np

SEED = 42

# -----------------------------------
def _set_seed():
    np.random.seed(SEED)
    random.seed(SEED)