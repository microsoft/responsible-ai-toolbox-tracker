.. _integration_mlflow:

Integration with MLFlow 
=======================

All models registered in the extension are also registered in a local deployment of mlflow.  

The Responsible AI Tracker mission is to offer data scientists and ML engineers an advance set of tools that allow them to compare their models’ accuracy metrics, to identify the part of the data that is underperforming, and to offer a set of mitigations to address these issues.  To achieve these goals, we needed an existing solution that is integrated with other popular machine learning frameworks and libraries, such as TensorFlow, Keras, PyTorch, and Scikit-Learn. A solution that can be used to track experiments, record results, and to deploy models through a variety of methods, such as Docker containers or cloud services like Azure ML and others.  After researching multiple existing solutions, we selected mlFlow because it covers most of our requirements.  
