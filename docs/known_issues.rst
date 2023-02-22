.. _known_issues:

Known Issues
=============

Opening notebooks via JupyterLab and Responsible AI Tracker extension  
---------------------------------------------------------------------

Upon browser refresh, the extension will only keep the notebooks that were initially opened via the extension. 
All other notebooks that were opened via the JupyterLab file explorer will be closed. We are working on finding a better solution to being 
able to restore state for both cases.   

Deleting projects 
-----------------

Upon deleting a project, the extension may fail to delete artifacts if they are being used by another process. This is an issue relevant 
to Windows installations. If this is the case, the extension will notify users that some files were not deleted, and that manual cleanup 
will be needed. The project will still be removed from the list of projects in the Tracker.   
