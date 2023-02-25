.. _getting-started:

Getting Started
===============

Responsible AI Tracker, a part of the `Responsible AI Toolbox`_, is a JupyterLab extension for managing, tracking, and comparing results of experiments for
improving machine learning (ML) models. The goal of responsible AI is to create trustworthy AI systems that benefit people while mitigating harms, which
can occur when AI systems fail to perform with fair, reliable, or safe outputs for various stakeholders. The Responsible AI Tracker is an extension that enables
AI practitioners to can view models, code, and visualization arteifacts all with in the same interface, facilitating disaggregated model evaluation and comparison, as well as
fast model iteration.

.. _Responsible AI Toolbox: https://responsibleaitoolbox.ai/

.. figure:: imgs/Responsible_AI_Tracker.png
  :scale: 18%
  :alt: Responsible AI Tracker

  Figure - Responsible AI Tracker brings together several artifacts needed for data science and machine learning practice: code, models, and comparative visualizations. 



**You can use Responsible AI Tracker to:**


    * **Manage and link model improvement artifacts.** Responsible AI Tracker encourages clean and systematic data science practices by allowing you to associate the notebook used to create a model with the resulting model. These practices support careful model tracking and systematic experimentation. 

    * **Perform disaggregated model evaluation and comparison.** The model comparison table in the extension provides an in-depth comparison between the different models registered in the extension. This comparison contrasts performance results across different data cohorts and metrics. This disaggregated approach goes beyond single-score performance metrics to help discover data cohorts for which an updated model may now underperform. Learn more about disaggregated evaluation approaches here. 

    * **Explore model improvements with the integrated Responsible AI Mitigations library.** As you experiment and ideate different steps for model improvement, the Responsible AI Mitigations library helps you implement different mitigation techniques in Python,  that may improve model performance and can be targeted towards specified cohorts of interests. 

  

