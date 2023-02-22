.. _user_guide:


User Guide
==========

Project Management
##################

Projects can be created through the main menu of the extension. Creating a new project will result in creating a dedicated project folder in the Responsible AI Tracker workspace. Currently, the extension supports either classification or regression projects. Depending on the type of project selected during project creation, the metrics shown and tracked in the model comparison table will change to either classification or regression metrics. It is also possible to optionally upload an initial notebook to the project. 

Project deletion will lead to deleting all related artifacts and the project folder from the workspace. 

TODO gif with project creation  

Notebook and Model management
##############################

The current tracking model of the extension enables mapping models to notebooks. This happens through the process of model registration. Exactly one model can be registered to one notebook. This is to encourage clean code organization and model management practices so that if it becomes necessary to go back and understand the code that created a given model, practitioners can directly access the corresponding notebook. If there is a need to create code that is reused across different models and notebooks, we encourage practitioners to save these in separate python files and keep in the notebooks only code that is specific to the registered model. 

Notebooks can be either directly created or imported from notebooks outside of the project workspace. It is also possible to duplicate a notebook from an existing one. During model registration, the registration process will also ask for the corresponding test dataset, which will then be used to score the model. All test datasets that have been used in at least one registered model can also be used to create cohorts later on. 

TODO gif with creating a notebook and registering a model on that notebook.  

Cohort Management
##################

Cohorts can be directly created, managed, or deleted through the cohort management interface. A cohort can be created from any overall test dataset. Creating a cohort from a test dataset entails adding filters to the test dataset. All added filters are then combined together through conjunctions (AND operators). The interface does not currently support disjunctions of filters (OR operators). 

Upon cohort creation, all models that have been registered using the given test dataset will then also be scored on the newly created cohort. This will result in creating a new row in the model comparison table for each affected model, displaying performance metrics of the model on the new cohort. 

TODO gif with creating a new cohort and showing how that changes the model comparison table. 

Creating Mitigations
####################

Each new notebook created in the project should ideally correspond to a mitigation attempt or experiment that is different from previous experiments. Mitigation experiments may involve data improvements, changes in the model class or architecture, changes in the loss function, hyperparameter selection, or changes in the optimization process (e.g., regularization, choice of optimization algorithms and methods).  

Tracking notebooks and registering models to notebooks accordingly enables tracking (in code) which types of mitigations have been applied in different mitigation experiments.  

The lightbulb button in the notebook menu will give you some initial ideas to explore on mitigation techniques from the Responsible AI Mitigations library. Some notable mitigation examples from raimitigation include data balancing and synthesis, feature engineering, missing value imputation. Most importantly, the library also simplifies the process of programmatically applying different data mitigation steps to different cohorts, in cases when the underlying issues for model errors are specific to those cohorts. 

TODO gif with creating a new notebook and using the lightbulb button and explore the different mitigations. 

Model Comparison
################

The model comparison table can be shown by clicking the “Compare Models” button. The notebook and model created first will serve as a baseline to the comparison. The table will compare models through different metrics and across created cohorts. It is also possible to restrict the table to only a set of selected notebooks, metrics or cohorts of choice. The list of notebooks, metrics, and cohorts can be customized in their respective dropdowns on top of the table. Only notebooks that have a registered model will be shown. 

The table has two views: absolute and comparative. The absolute view will show raw absolute score metrics and will be shaded using one single color. Generally, it is recommended to use a stronger shade for desirable performance. The comparative view will also show the corresponding differences between model performance and the baseline performance either for the overall dataset or for the given cohort. For example, if the accuracy of the baseline is 0.8 in the overall dataset and the accuracy of a mitigated model is 0.85 for the overall dataset, the respective cell in the table will show 0.85 (0.05 ↑), indicating that there is a 0.05 improvement for the overall dataset. Similarly, if the accuracy of the baseline for the same baseline is instead 0.9 for cohort A, but it is 0.87 for the newly mitigated model, the respective cell for the model and cohort A will show 0.87 (0.03 ↓) indicating a 0.03 decline in accuracy for cohort A. This enables a 1:1 comparison across cohorts over several models. The shading in the comparative view is based on two colors: one for performance improvement and one for performance decline.  

TODO gif with showing the model comparison table in both modes: absolute and comparative. 

Some mitigation steps might make test datasets incompatible with mitigated models. For example, mitigation steps such as feature encoding or feature selection may change the number of features in the test dataset, while the number of records (rows) remains the same. While Responsible AI Tracker is not able to track these changes automatically, it is still possible to register a model with an adjusted test dataset. Note that the cohort definitions created from one test dataset will not transfer to another one, even if the number of records remains the same. In this case, we recommend that corresponding cohorts are created again through the cohort management interface using now the adjusted test dataset. Afterwards, it is possible to enable a 1:1 comparison of the adjusted cohort with the original one using the overflow menu (…) for that cohort in the model comparison table. 

TODO gif showing the overflow menu where we directly choose to compare a cohort with another one from the baseline. 

Integration with MLFlow
#######################

All models registered in the extension are also registered in a local deployment of mlflow.  

TODO: Besa to work with Dany in writing down this text. Besa and Dany 

Metrics Supported
#################

Responsible AI Tracker reports the following metrics depending on the prediction problem: 

Classification: accuracy, precision, recall, F1, logloss 

Regression: mean-squared error (mse), root mean-squared error (rmse), mean absolute error (mae), r-squared (r2) 

TODO: add link above to the library we are using to compute these metrics specifically. In this case sklearn. 

TODO: add note here to describe whether we are taking a macro vs micro approach on computing metrics. 

