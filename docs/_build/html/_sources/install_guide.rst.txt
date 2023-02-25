.. _install_guide:

Installation Guide
==================

The RAI Tracker can be deployed on Windows or Ubuntu Os, using anaconda or python.

The RAI Tracker prerequisites:
##############################

**NodeJs**:
  
  * NodeJs: `Nodejs`_.

  .. _Nodejs : https://nodejs.org/en/

**Python** (versions supported 3.9 to 3.10.6)
  
  * Python: `Python`_.

  .. _Python : https://www.python.org/downloads/

**JupyterLab**

  * If you use pip:

  ..  code-block:: console

      > pip install jupyterlab==3.6.1
  
  * If you use conda:
 
  ..  code-block:: console

      > conda install -c conda-forge jupyterlab==3.6.1


The Responsible AI Tracker has two installation options:
########################################################
  
The default installation only installs the essential packages.

  .. code-block:: console

      > pip install raitracker

The installation With the [all] flag installs the essential packages plus PyTorch, and Tensorflow.

   .. code-block:: console

      > pip install raitracker[all]


Running:
########

To install, open your console and type:

.. code-block:: console

    > jupyter lab
    
The extension should be available in the left vertical bar.


