.. _notebook_model_management:

Notebook and Model Management 
=============================

The current tracking model of the extension enables mapping models to notebooks. This happens through the process of model registration. 
Exactly one model can be registered to one notebook. This is to encourage clean code organization and model management practices so that if it 
becomes necessary to go back and understand the code that created a given model, practitioners can directly access the corresponding notebook. 
If there is a need to create code that is reused across different models and notebooks, we encourage practitioners to save these in separate 
python files and keep in the notebooks only code that is specific to the registered model. 

Notebooks can be either directly created or imported from notebooks outside of the project workspace. It is also possible to duplicate a 
notebook from an existing one. During model registration, the registration process will also ask for the corresponding test dataset, 
which will then be used to score the model. All test datasets that have been used in at least one registered model can also be used to create 
cohorts later on.  

.. figure:: imgs/model_registration.gif
  :scale: 45%
  :alt: Responsible AI Tracker