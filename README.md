![MIT license](https://img.shields.io/badge/License-MIT-blue.svg)

# Responsible AI Tracker

Responsible AI Tracker is a JupyterLab Extension for managing, tracking, and comparing results of machine learning experiments for model improvement. Using this extension, users can view models, code, and visualization artifacts within the same framework enabling fast model iteration and evaluation processes. The extension is a work-in-progress research prototype to test and understand tooling functionalities and visualizations that can be helpful to data scientists. If you would like to propose new ideas for improvement feel free to contact the development team at [rai-toolbox@microsoft.com](mailto:rai-toolbox@microsoft.com) or create new issues in this repository.

This repo is a part of the [Responsible AI Toolbox](https://github.com/microsoft/responsible-ai-toolbox#responsible-ai-toolbox), a suite of tools providing a collection of model and data exploration and assessment user interfaces and libraries that enable a better understanding of AI systems. These interfaces and libraries empower developers and stakeholders of AI systems to develop and monitor AI more responsibly, and take better data-driven actions.

### Main functionalities of the tracker include:

- **Managing and linking model improvement artifacts**: the extension encourages clean and systematic data science practices by allowing users to associate the notebook used to create a model with the resulting model. These practices support careful model tracking and systematic experimentation.

- **Disaggregated model evaluation and comparisons**: the model comparison table in the extension provides an in-depth comparison between the different models registered in the extension. This comparison contrasts performance results across different data cohorts and metrics, following a disaggregated approach, which goes beyond single-score performance numbers and highlights cohorts of data for which a model may perform worse than its older versions. Read more about disaggregated analysis [here](https://responsible-ai-toolbox-tracker.readthedocs.io/en/latest/basics_disaggregated.html).

- **Integration with the Responsible AI Mitigations library**: as data scientists experiment and ideate different steps for model improvement, the [Responsible AI Mitigations Library](https://github.com/microsoft/responsible-ai-toolbox-mitigations) helps them implement different mitigation techniques in python that may improve model performance and can be targeted towards specified cohorts of interests.

## Tour

Watch a [video tour](https://www.youtube.com/watch?v=jN6LWFzSLaU) of the Responsible AI Tracker and follow along using the notebooks and dataset [here](./tour).
<p align="center">
<img src="./docs/imgs/RAI%20Tracker%20full%20view.png" alt="ResponsibleAITrackerOverview" width="750"/>



## Installation

The Responsible AI Tracker can be deployed on Windows or Ubuntu, using anaconda or python.

### The Responsible AI Tracker prerequisites:

- [Nodejs](https://nodejs.org/)
- [Python](https://www.python.org/downloads/) (versions supported 3.9 **to** 3.10.6)

- JupyterLab
  - If you use pip:
  ```shell
  pip install jupyterlab==3.6.1
  ```
  - If you use conda:
  ```shell
  conda install -c conda-forge jupyterlab==3.6.1
  ```

### The Responsible AI Tracker has two installation options:

- The default installation only installs the essential packages.

  ```shell
  pip install raitracker
  ```

- The installation With the [all] flag installs the essential packages plus PyTorch, and Tensorflow.
  ```shell
  pip install raitracker[all]
  ```

Installation through the JupyterLab Extension Manager coming soon. 

### Running

Start up JupyterLab using:

```bash
jupyter lab
```

The extension should be available in the left vertical bar. For ideas on getting started, watch the [video tour](https://www.youtube.com/watch?v=jN6LWFzSLaU) and follow along using the notebooks and dataset [here](./tour).
 
<details><summary>Dependencies</summary>
<ul>

<li>jupyterlab</li>
<li>fluentui</li>
<li>nodejs</li>
<li>react</li>
<li>redux</li>
<li>lumino</li>
<li>lodash</li>
<li>babel</li>
<li>codeMirror</li>
<li>webpack</li>
<li>mlflow</li>
<li>numpy</li>
<li>pandas</li>
<li>scikit-learn</li>
<li>pytorch</li>
</ul>
</details>

---

## Getting help

We encourage you to check the Responsible AI Tracker [documentation](https://responsible-ai-toolbox-tracker.readthedocs.io/en/latest/). 

For Responsible AI Mitigations Library help see [Responsible AI Mitigations documentation](https://responsible-ai-toolbox-mitigations.readthedocs.io/en/latest/).  

See [here](https://github.com/microsoft/responsible-ai-toolbox-tracker/blob/main/SUPPORT.md) for further support information.


### Bug reports

To report a bug please read the [guidelines](https://responsible-ai-toolbox-tracker.readthedocs.io/en/latest/) and then open a [Github issue](https://github.com/microsoft/responsible-ai-toolbox-tracker/issues/new). 


### Feature requests

We welcome suggestions for new features as they help make the project more useful for everyone. To request a feature please use the [feature request template](https://github.com/microsoft/responsible-ai-toolbox-tracker/labels/enhancement).

### Contributing

To contribute code or documentation to the Responsible AI Tracker, please read the [contribution guidelines](https://github.com/microsoft/responsible-ai-toolbox-tracker/blob/main/CONTRIBUTING.md).

---

## Microsoft Open Source Code of conduct

The [Microsoft  Code of conduct](https://github.com/microsoft/responsible-ai-toolbox-tracker/blob/main/CODE_OF_CONDUCT.md) outlines expectations for participation in Microsoft-managed open source communities.


## Trademarks

This project may contain trademarks or logos for projects, products, or services. Authorized use of Microsoft 
trademarks or logos is subject to and must follow 
[Microsoft's Trademark & Brand Guidelines](https://www.microsoft.com/en-us/legal/intellectualproperty/trademarks/usage/general).
Use of Microsoft trademarks or logos in modified versions of this project must not cause confusion or imply Microsoft sponsorship.
Any use of third-party trademarks or logos are subject to those third-party's policies.

## Research and Acknowledgements

**Current Maintainers:** [ThuVan Pham](https://www.microsoft.com/en-us/research/people/thuvanp/), [Matheus Mendonça](https://github.com/mrfmendonca), [Besmira Nushi](https://github.com/nushib), [Rahee Ghosh Peshawaria](https://github.com/raghoshMSFT), [Marah Abdin](https://github.com/marah-abdin), [Mark Encarnación](https://github.com/markenc), [Dany Rouhana](https://github.com/danyrouh)

**Past Maintainers:** [Irina Spiridonova](https://github.com/irinasp)

**Research Contributors:** [Besmira Nushi](https://github.com/nushib), [Jingya Chen](https://www.jingyachen.net/), [Rahee Ghosh Peshawaria](https://github.com/raghoshMSFT), [ThuVan Pham](https://www.microsoft.com/en-us/research/people/thuvanp/), [Matheus Mendonça](https://github.com/mrfmendonca), [Ece Kamar](https://www.ecekamar.com/), [Dany Rouhana](https://github.com/danyrouh)