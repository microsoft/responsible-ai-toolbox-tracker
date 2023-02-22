.. _frequent_asked:

Frequently Asked Questions
==========================

What types of models does Responsible AI Tracker support? 
---------------------------------------------------------

You can register models trained via sklearn, PyTorch, and TensorFlow. In addition, it is also possible to register models that are trained with 
libraries like `LightGBM`_ or `XGBoost`_ or other libraries that follow the ``.fit()`` and ``.transform()`` training and inference methods.  

.. _LightGBM: https://github.com/microsoft/LightGBM
.. _XGBoost: https://github.com/dmlc/xgboost


What types of data does Responsible AI Tracker support?
-------------------------------------------------------

Responsible AI Tracker currently supports only tabular data. Tabular features can be numerical, categorical, or ordinal. 
Target labels can be categorical or binary for classification problems, and numerical for regression problems.

What is a cohort? 
-----------------

Cohorts are subsets of data created by manually adding filters to the overall test datasets. Creating cohorts enables disaggregated model 
evaluation and comparison by including such cohorts in model comparison. Disaggregated model comparison helps in understanding areas where 
new models perform better or worse than the baseline. Some examples of cohorts can be “age >= 50” or “occupation= 'teacher' ”.  

What if my notebook results in the creation of many models? 
-----------------------------------------------------------

While the code in the notebook may result in the creation of many models, Responsible AI Tracker can only register one model to that notebook. 
This is to encourage clean code organization and model management practices. With the exception of hyperparameter search mitigation steps, 
it is recommended that different mitigation techniques are organized in separate notebooks for easy reference. In the case of hyperparameter 
search, practitioners can still select one resulting model as a representative of the model of choice for that notebook. 

The mitigation step I am experimenting with requires the modification of the test dataset features. How can I still perform disaggregated model comparison across cohorts?  
--------------------------------------------------------------------------------------------------------------------------------------------------------------------------

Responsible AI Tracker can only compare models across a single test dataset conceptually. However, the test dataset may change or get adjusted 
in terms of the nature or number of features after mitigation steps like feature encoding or feature selection. While conceptually this is 
still the same test dataset, for comparison purposes it becomes incompatible.  

For example, imagine a situation where the original training dataset has three features: x1, x2, x3. A feature selection mitigation concludes that feature x2 is redundant and removes it from the dataset. This requires removing x2 also from the test dataset, otherwise calling the .predict() method on the original dataset would fail. 

To account for these situations, practitioners can train and register the newly mitigated model using the new test dataset (with only x1 and x3). If there are any cohorts stemming from the original dataset, they will need to be created again using the new test dataset. The 1:1 comparison between the corresponding cohorts can be made using the overflow (…) menus in the model comparison table. 
