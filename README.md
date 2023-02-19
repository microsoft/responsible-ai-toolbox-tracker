# Responsible AI Tracker

Responsible AI Toolbox Tracker is a JupyterLab Extension for managing, tracking, and comparing results of machine learning experiments for model improvement. Using this extension, users can view models, code, and visualization artifacts within the same framework enabling therefore fast model iteration and evaluation processes.

### Main functionalities include:

- **Managing and linking model improvement artifacts**: the extension encourages clean and systematic data science practices by allowing users to associate the notebook used to create a model with the resulting model. These practices support careful model tracking and systematic experimentation.

- **Disaggregated model evaluation and comparisons**: the model comparison table in the extension provides an in-depth comparison between the different models registered in the extension. This comparison contrasts performance results across different data cohorts and metrics, following therefore a disaggregated approach, which goes beyond single-score performance numbers and highlights cohorts of data for which a model may perform worse than its older versions.

- **Integration with the Responsible AI Mitigations library**: as data scientists experiment and ideate different steps for model improvement, the Responsible AI Mitigations library helps them implement different mitigation techniques in python that may improve model performance and can be targeted towards specified cohorts of interests.

- **Integration with mlflow**: all models registered in a project in the Responsible AI Tracker can be fully synchronized with a corresponding project in mlflow. This integration brings the best of both worlds and at the same time allows practitioners to continue their usual MLOps practices via commonly used tools such as mlflow.

## Installation

The RAI Tracker can be deployed on Windows or Ubuntu Os, using anaconda or python.

### The RAI tracker prerequisites:

- NodeJs:

  - **NodeJs:** [Nodejs](https://nodejs.org/)<br /><br />

- Python (versions supported 3.9 **to** 3.10.6)

  - **Python:** [Python](https://www.python.org/downloads/)<br /><br />

- JupyterLab
  - If you use pip:
  ```shell
  pip install jupyterlab==3.5.2
  ```
  - If you use conda:
  ```shell
  conda install -c conda-forge jupyterlab==3.5.2
  ```

### RAI tracker has two installation options:

- The default installation only installs the essential packages.

  ```shell
  pip install raitracker-0.1.0-py3-none-any.whl
  ```

- The installation With the [all] flag installs the essential packages plus PyTorch, and Tensorflow.
  ```shell
  pip install raitracker-0.1.0-py3-none-any.whl[all]
  ```

### Running

Start up JupyterLab using:

```bash
jupyter lab
```

The extension should be available in the left vertical bar.

---

## Getting help

We encourage you to check the RAI Tracker help documentation [RAI Tracker help](https://responsible-ai-toolbox-tracker.readthedocs.io/en/latest/). 

For Responsible AI Mitigation help [RAI Mitigation help](https://responsible-ai-toolbox-mitigations.readthedocs.io/en/latest/).  

For more support [RAI Tracker support](https://github.com/microsoft/responsible-ai-toolbox-tracker/blob/main/SUPPORT.md).


### Bug report

To report a bug please read the [guidelines](https://responsible-ai-toolbox-tracker.readthedocs.io/en/latest/) and then open a [Github issue](https://github.com/microsoft/responsible-ai-toolbox-tracker/issues/new). 


### Feature request

We also welcome suggestions for new features as they help make the project more useful for everyone. To request a feature please use the [feature request template](https://github.com/microsoft/responsible-ai-toolbox-tracker/labels/enhancement).


## Development

### Contributing

To contribute code or documentation to the Responsible AI Tracker, please read the [contributor documentation](https://responsible-ai-toolbox-tracker.readthedocs.io/en/latest/).

### License

Responsible AI Tracker uses the Microsoft open source license. All code is licensed under the terms of [Microsoft license](https://github.com/microsoft/responsible-ai-toolbox-tracker/blob/main/LICENSE).

### Microsoft Open Source Code of conduct

Microsoft code of conduct outlines expectations for participation in Microsoft-managed open source communities [Microsoft  Code of conduct](https://github.com/microsoft/responsible-ai-toolbox-tracker/blob/main/CODE_OF_CONDUCT.md).


### Microsoft security 

Microsoft security standards [Microsoft security](https://github.com/microsoft/responsible-ai-toolbox-tracker/blob/main/SECURITY.md).