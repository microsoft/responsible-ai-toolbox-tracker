.. _how:

How This Extension Works With Responsible AI Toolbox 
=====================================================
Responsible AI Tracker works in conjunction with the `Responsible AI Toolbox`_: 

.. _Responsible AI Toolbox: https://responsibleaitoolbox.ai/


**Step 1.** Detect and diagnose model failure modes using the Toolbox’s `Responsible AI Dashboard`_. The Dashboard brings together Responsible AI tools for `model interpretability`_, assessment and mitigation of `fairness issues`_, `error analysis`_, `causal inference`_, and `counterfactual analysis`_ for debugging models and holistic disaggregated evaluation. (More on how you can leverage the Dashboard.)  

.. _Responsible AI Dashboard: https://responsibleaitoolbox.ai/introducing-responsible-ai-dashboard/
.. _model interpretability: https://interpret.ml/
.. _fairness issues: https://fairlearn.org/
.. _error analysis: https://erroranalysis.ai/
.. _causal inference: https://github.com/microsoft/EconML
.. _counterfactual analysis: https://github.com/interpretml/DiCE

**Step 2.** Explore these compatible libraries for potential mitigation steps for data cohorts: 

* `Responsible AI Mitigations Library`_, which includes data balancing and synthesis; feature engineering; and imputing missing values, among others. Most importantly, the library simplifies programmatic application of different mitigation steps for different cohorts that have specific underlying data issues contributing to model errors. 
  
.. _Responsible AI Mitigations Library: https://github.com/microsoft/responsible-ai-toolbox-mitigations

* `Fairlearn`_, which offers mitigations for fairness issues. The Fairlearn approach frames model underperformance for given cohorts as a cost-sensitive classification problem, where samples that satisfy a particular constraint (similar to the cohort definition) are weighed differently in the optimization process.  

.. _Fairlearn: https://fairlearn.org/

**Step 3.** Conduct disaggregated model (re)evaluation and comparison using the Responsible AI Tracker to confirm that the issues you set out to mitigate are indeed mitigated and without negative side effects on other cohorts. The Responsible AI Tracker enables you to conduct systematic experimentation with careful tracking as it lets you view models, code, and visualization artifacts all in the same interface.  

.. figure:: imgs/diagnose_mitigate.png
  :scale: 18%
  :alt: Responsible AI Tracker

  Figure - Responsible AI Tracker tracks, compares, and validates different Responsible AI mitigations. 