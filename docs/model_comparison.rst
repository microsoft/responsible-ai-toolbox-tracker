.. _model_comparison:

Model Comparison
================

The model comparison table can be shown by clicking the “Compare Models” button. The notebook and model created first will serve as a baseline 
to the comparison. The table will compare models through different metrics and across created cohorts. It is also possible to restrict the 
table to only a set of selected notebooks, metrics or cohorts of choice. The list of notebooks, metrics, and cohorts can be customized in 
their respective dropdowns on top of the table. Only notebooks that have a registered model will be shown. 

The table has two views: absolute and comparative. The absolute view will show raw absolute score metrics and will be shaded using one single 
color. Generally, it is recommended to use a stronger shade for desirable performance. The comparative view will also show the corresponding 
differences between model performance and the baseline performance either for the overall dataset or for the given cohort. For example, 
if the accuracy of the baseline is 0.8 in the overall dataset and the accuracy of a mitigated model is 0.85 for the overall dataset, 
the respective cell in the table will show 0.85 (0.05 ↑), indicating that there is a 0.05 improvement for the overall dataset. Similarly, 
if the accuracy of the baseline for the same baseline is instead 0.9 for cohort A, but it is 0.87 for the newly mitigated model, the respective 
cell for the model and cohort A will show 0.87 (0.03 ↓) indicating a 0.03 decline in accuracy for cohort A. This enables a 1:1 comparison 
across cohorts over several models. The shading in the comparative view is based on two colors: one for performance improvement and one for 
performance decline.  

.. figure:: imgs/absolute_view.png
  :scale: 40%
  :alt: Responsible AI Tracker


Some mitigation steps might make test datasets incompatible with mitigated models. For example, mitigation steps such as feature encoding or 
feature selection may change the number of features in the test dataset, while the number of records (rows) remains the same. While Responsible 
AI Tracker is not able to track these changes automatically, it is still possible to register a model with an adjusted test dataset. Note that 
the cohort definitions created from one test dataset will not transfer to another one, even if the number of records remains the same. In this 
case, we recommend that corresponding cohorts are created again through the cohort management interface using now the adjusted test dataset. 
Afterwards, it is possible to enable a 1:1 comparison of the adjusted cohort with the original one using the overflow menu (…) for that cohort 
in the model comparison table.


