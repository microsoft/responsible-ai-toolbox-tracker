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

## Development

### Clone repository

```
git clone https://msresearch@dev.azure.com/msresearch/MLMitigationWorkflows/_git/ErrorsMitigationClient
```

### Using Anaconda

**Anaconda:** [Miniconda](https://docs.conda.io/en/latest/miniconda.html)

```
cd ErrorsMitigationClient

conda create -n <env name> --override-channels --strict-channel-priority -c conda-forge -c nodefaults jupyterlab=3.5.2 python=3.10.6

conda activate <env name>
```

## Install the required software

### Using npm

```
npm install
```

### Build the client code

```
npm run build
```

### Install python build

```
python -m pip install build
```

### Build the codebase every time you make code changes.

```
python -m build
```

### Install the extension

```
pip install -e .
```

## Running

Run JupyterLab:

```
jupyter lab
```
The extension should be available in the left vertical bar.

### Coding
After every client code change run: 
```
npm run build 
```
Refresh your browser to see the changes.

For the server python code changes run: 
```
python -m build
```
Refresh your browser to see the changes.
