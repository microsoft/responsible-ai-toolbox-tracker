.. _creating_mitigations:

Creating Mitigations 
====================

Each new notebook created in the project should ideally correspond to a mitigation attempt or experiment that is different from previous experiments. Mitigation experiments may involve data improvements, changes in the model class or architecture, changes in the loss function, hyperparameter selection, or changes in the optimization process (e.g., regularization, choice of optimization algorithms and methods).  

Tracking notebooks and registering models to notebooks accordingly enables tracking (in code) which types of mitigations have been applied in different mitigation experiments.  

The lightbulb button in the notebook menu will give you some initial ideas to explore on mitigation techniques from the `Responsible AI Mitigations library`_. Some notable mitigation examples from raimitigation include data balancing and synthesis, feature engineering, missing value imputation. Most importantly, the library also simplifies the process of programmatically applying different data mitigation steps to different cohorts, in cases when the underlying issues for model errors are specific to those cohorts. 

.. _Responsible AI Mitigations library: https://github.com/microsoft/responsible-ai-toolbox-mitigations

.. figure:: imgs/mitigation_ideas.gif
  :scale: 50%
  :alt: Responsible AI Tracker