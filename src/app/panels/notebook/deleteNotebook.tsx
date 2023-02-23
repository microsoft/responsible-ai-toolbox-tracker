// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React, { useState } from 'react';
import { Label } from '@fluentui/react/lib/Label';
import { useSelector, useDispatch } from 'react-redux';
import { Spinner, SpinnerSize } from '@fluentui/react/lib/Spinner';
import { PrimaryButton, DefaultButton } from '@fluentui/react/lib/Button';
import { Dialog, DialogType, DialogFooter } from '@fluentui/react/lib/Dialog';
import { Utils } from '../../../core/utils';

export const DeleteNotebook: React.FunctionComponent = (props) => {
    /**
     * retrieve the app state.
    */
    const dispatch = useDispatch();
    const state = useSelector((state) => state);
    const projectSettings = state['projectSettings'];
    const projectName = projectSettings['name'];
    const showDialog = state['notebookDialogState'];
    let notebooks = projectSettings['notebooks'];
    let selectedModels = projectSettings['selectedModels'];
    let selectedCohorts = projectSettings['selectedCohorts'];
    let datasets = projectSettings['datasets'];
    let notebookName: string = '';
    let notebookPath: string = '';
    const children = props.children;
    if (children) {
        notebookName = children['name'];
        notebookPath = children['path'];
    }
    let [waitSpinner, setWaitSpinner] = useState(false);
    /**
     * dialog default settings.
    */
    const modelProps = {
        isBlocking: false,
        styles: { main: { maxWidth: 450, minWidth: 400 } },
    };
    const dialogContentProps = {
        type: DialogType.largeHeader,
        title: 'Confirm delete',
    };
    /**
    * Update the project settings.
    */
    const _updateProjectSettings = async (_utils:Utils) => {
        return _utils.UpdateProjectSettings(projectSettings, undefined, undefined, undefined, undefined, undefined, undefined, notebooks, notebookName)
            .then(response => {
                return response;
            })
            .catch((error: Error) => {
                console.log("Notebook delete update settings error:" + error.message);
            });
    }
    /**
     * 
     * @param resource 
    */
    const updateDatasetSettings = async (resource: any) => {
        let _datasets: any[] = [];
        for (let db of datasets) {
            if (db.name !== resource.name) {
                _datasets.push(db);
            }
        }
        datasets = _datasets;
        projectSettings['datasets'] = _datasets;
    }
    /**
     * 
     * @param resources 
    */
    const updateNotebookSettings = async (resources: any[]) => {
        let _notebooks: any[] = [];
        for (let ent of notebooks) {
            if (ent.name !== notebookName) {
                _notebooks.push(ent);
            }
        }
        notebooks = _notebooks;
        projectSettings['notebooks'] = _notebooks;
        /**
         * update the selected models list.
        */
        const index = selectedModels.indexOf(notebookName, 0);
        if (index !== -1) {
            selectedModels.splice(index, 1);
            projectSettings['selectedModels'] = selectedModels;
        }
        /**
         * Update the restorer, and initiate action when delete file is already open.
        */
        const restoreIndex = projectSettings['notebooksRestorer'].indexOf(notebookPath);
        if (restoreIndex !== -1) {
            projectSettings['notebooksRestorer'].splice(restoreIndex, 1);
        }
        for (let res of resources) {
            if (res.delete) {
                switch (res.key) {
                    case 'name':
                        const cohortIndex = selectedCohorts.indexOf(res.name, 0);
                        if (cohortIndex !== -1) {
                            selectedCohorts.splice(cohortIndex, 1);
                            projectSettings['selectedCohorts'] = selectedCohorts;
                        }
                        updateDatasetSettings(res).then(content => {
                            dispatch({ type: 'SELECTED_COHORTS_VISUAL', payload: selectedCohorts });
                        });

                        break;
                    default:
                        break;
                }
            }
        }
    }
    /**
     * Confirm delete request.
    */
    const confirmDelete = async () => {
        setWaitSpinner(true);
        let _utils = new Utils();
        let paths: string[] = [];
        paths.push(notebookPath);
        state['closeNotebook'](paths);
        /**
         * Identify the resources that should be delete it.
        */
        let resources = await _utils.identifyResources(notebooks, notebookName);
        /**
         * Delete the notebook resources.
        */
        const success = await _utils.deleteNotebookResources(projectName, resources, notebookPath);

        if (success) {
            await updateNotebookSettings(resources);
            /**
             * Resources are deleted. Notebooks and datasets settings state are updated. Update the project settings.
            */
            _updateProjectSettings(_utils).then(content => {
                if (content) {
                    dispatch({ type: 'PROJECT_SETTINGS', payload: projectSettings });
                    dispatch({ type: 'NOTEBOOK_DELETE_DIALOG_STATE', payload: true });
                }
                else {
                    //todo: raise an error
                }
                setWaitSpinner(false);
            });
        } else {
            setWaitSpinner(false);
            console.log("Failed to delete all notebook resources.")
        }
    }

    const onDismiss = () => {
        dispatch({ type: 'NOTEBOOK_DELETE_DIALOG_STATE', payload: true });
    }

    return (
        <Dialog
            hidden={showDialog}
            onDismiss={onDismiss}
            dialogContentProps={dialogContentProps}
            modalProps={modelProps}
        >
            <div className='deleteDialog'>
                <div>
                    <Label className="deleteDialogLabel">
                        Are you sure you want to permanently delete this notebook and all its resources? <br /><b>{notebookName}</b>
                    </Label>
                </div>
                <div>
                    {waitSpinner ? (<Spinner size={SpinnerSize.medium} label="Deleting notebook resources, please wait..." ariaLive="assertive" labelPosition="bottom" />) : (
                        <></>
                    )}
                </div>
            </div>
            <DialogFooter>
                <PrimaryButton onClick={confirmDelete} text="Confirm" />
                <DefaultButton onClick={onDismiss} text="Cancel" />
            </DialogFooter>
        </Dialog>
    );
}
