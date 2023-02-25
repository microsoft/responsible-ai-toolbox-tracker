.. _metric_support:

Metric Support
==============

Responsible AI Tracker reports the following metrics depending on the prediction problem: 

* **Classification:** `accuracy`_, `precision`_, `recall`_, `F1`_, `roc_auc`_, `logloss`_
    For binary classification, the averaging parameter in precision, recall, and F1 scores in sklearn is set to "binary" (i.e., average = "binary"). For the roc_auc score the multiclass parameter is set to "raise" (i.e., multi_class = "raise"). 

    For multiclass classification, the averaging parameter in precision, recall, and F1 scores in sklearn is set to "macro" (i.e., average = "macro"). For the roc_auc score the multiclass parameter is set to "ovr" (i.e., multi_class = "ovr"). 

.. _accuracy: https://scikit-learn.org/stable/modules/generated/sklearn.metrics.accuracy_score.html#sklearn.metrics.accuracy_score
.. _precision: https://scikit-learn.org/stable/modules/generated/sklearn.metrics.precision_score.html#sklearn.metrics.precision_score
.. _recall: https://scikit-learn.org/stable/modules/generated/sklearn.metrics.recall_score.html#sklearn.metrics.recall_score
.. _F1: https://scikit-learn.org/stable/modules/generated/sklearn.metrics.f1_score.html#sklearn.metrics.f1_score
.. _logloss: https://scikit-learn.org/stable/modules/generated/sklearn.metrics.log_loss.html#sklearn.metrics.log_loss
.. _roc_auc: https://scikit-learn.org/stable/modules/generated/sklearn.metrics.roc_auc_score.html

* **Regression:** `mean-squared error`_ (mse), `root mean-squared error`_ (rmse), `mean absolute error`_ (mae), `r-squared`_ (r2) 

.. _mean-squared error: https://scikit-learn.org/stable/modules/generated/sklearn.metrics.mean_squared_error.html#sklearn.metrics.mean_squared_error
.. _root mean-squared error: https://scikit-learn.org/stable/modules/generated/sklearn.metrics.mean_squared_error.html#sklearn.metrics.mean_squared_error
.. _mean absolute error: https://scikit-learn.org/stable/modules/generated/sklearn.metrics.mean_absolute_error.html#sklearn.metrics.mean_absolute_error
.. _r-squared: https://scikit-learn.org/stable/modules/generated/sklearn.metrics.r2_score.html#sklearn.metrics.r2_score

