.. _cohort_management:

Cohort Management 
=================

Cohorts can be directly created, managed, or deleted through the cohort management interface. A cohort can be created from any overall test 
dataset. Creating a cohort from a test dataset entails adding filters to the test dataset. All added filters are then combined together through 
conjunctions (AND operators). The interface does not currently support disjunctions of filters (OR operators). 

Upon cohort creation, all models that have been registered using the given test dataset will then also be scored on the newly created cohort. 
This will result in creating a new row in the model comparison table for each affected model, displaying performance metrics of the model on 
the new cohort. 

.. figure:: imgs/cohort_creation.gif
  :scale: 50%
  :alt: Responsible AI Tracker