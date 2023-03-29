// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React from 'react';
import { PathExt } from '@jupyterlab/coreutils';
import { FontIcon } from '@fluentui/react/lib/Icon';
import { useSelector, useDispatch } from 'react-redux';
import {
    TooltipHost,
    ITooltipHostStyles
} from '@fluentui/react/lib/Tooltip';
import { Utils } from '../../../core/utils';
import { OpenProject } from './openProject';
import { DeleteProject } from './deleteProject';
import { ConfirmDelete } from './confirmDelete';
import { PropertiesModal } from './propertiesModal';
import { NewProjectModal } from './newProjectModal';
import { notebookInfo } from '../notebook/bookPanel';
import { ModelRegistration } from '../models/modelReg';
import { ActiveProjectData } from './activeProjectData';
import { INotebookType } from '../../../core/components';
import { ImportNotebook } from '../notebook/importNotebook';
import { DeleteNotebook } from '../notebook/deleteNotebook';
import { EditModelRegistration } from '../models/editModelReg';
export interface INotebookRecordType {
    id: number;
    key: string;
    notebookName: string;
    notebook: any;
    registeredModel: boolean;
    model: any;
    accuracy: string;
}
/**
 * 
 * @param _notebooks 
 * @returns 
*/
export const getNotebooks = (_notebooks: any): INotebookType[] => {
    let notebook = {} as INotebookType;
    let notebookList: INotebookType[] = [];
    for (const key in _notebooks) {
        notebook.name = _notebooks[key]['name'];
        if (_notebooks[key]['registeredModel'] !== '') {
            notebook.registeredModel = _notebooks[key]['registeredModel'];
            notebook.mlPlatform = _notebooks[key]['mlPlatform'];
        }
        else {
            notebook.registeredModel = undefined;
            notebook.mlPlatform = undefined;
        }
        if (_notebooks[key]['metrics']['accuracy'] !== undefined) {
            notebook.modelAccuracy = _notebooks[key]['metrics']['accuracy'];
        }
        else {
            notebook.modelAccuracy = '-';
        }
        notebook.dateCreated = _notebooks[key].dateCreated;
        notebook.lastUpdated = _notebooks[key].lastUpdated;
        notebookList.push(notebook);
        notebook = {} as INotebookType;
    }
    return notebookList
}
/**
 * 
 * @returns 
*/
export const ActiveProject: React.FunctionComponent = () => {
    const METRICS_ROUND_NUM = 3;
    const WORKSPACE_DIR = 'workspace';
    const ARTIFACTS_DIR = 'artifacts';
    const NOTEBOOK_DISPLAY = 20;
    const hostStyles: Partial<ITooltipHostStyles> = { root: { display: 'inline-block', alignContent: 'left' } };
    /**
     * retrieve the app state.
    */
    const dispatch = useDispatch();
    const state = useSelector((state) => state);
    let projectSettings = state['projectSettings'];
    const projectName = projectSettings['name'];
    let datasets = projectSettings['datasets'];
    const notebookList = projectSettings['notebooks'];
    let selectedModels = projectSettings['selectedModels'];
    let selectedCohorts = projectSettings['selectedCohorts'];
    let majorMetric = projectSettings['problemTypeMajorMetric'];
    let problemType = projectSettings['problemType'];
    let notebooksRestorer = projectSettings["notebooksRestorer"];
    if (majorMetric === undefined || majorMetric.length === 0) {
        if (problemType && problemType.toLowerCase() === 'classification') {
            majorMetric = 'accuracy';
        } else if (problemType && problemType.toLowerCase() === 'regression') {
            majorMetric = 'mae';
        }
        else {
            majorMetric = '';
        }
    }
    /**
     * get the list of active notebooks.
    */
    let notebookData = {} as INotebookRecordType;
    const openNotebook = async (event) => {
        const _utils = new Utils();
        const filePath = PathExt.join(WORKSPACE_DIR, projectName, ARTIFACTS_DIR, event.currentTarget.id);
        let nWidget = await state['openNotebook'](filePath);
        nWidget.context.save();
        if (notebooksRestorer?.indexOf(filePath) === -1) {
            notebooksRestorer.push(filePath);
            projectSettings["notebooksRestorer"] = notebooksRestorer;
            _utils.UpdateBaseProjectSettings(projectSettings);
        }
    }
    /**
     * Open the register model modal.
     * @param event 
    */
    const registerModel = (event) => {
        dispatch({ type: 'IN_REGISTER_NOTEBOOK_ID', payload: event.currentTarget.id });
        dispatch({ type: 'MODEL_REGISTRATION_MODAL_STATE', payload: true });
    }
    /**
     * Open the edit model registration modal.
     * @param event 
    */
    const editModelRegistration = (event) => {
        dispatch({ type: 'IN_EDIT_NOTEBOOK_ID', payload: event.currentTarget.id });
        dispatch({ type: 'EDIT_MODEL_REGISTRATION_MODAL_STATE', payload: true });
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
    const updateNotebookSettings = async (resources: any[], notebookName: string) => {
        for (let notebook of notebookList) {
            if (notebook.name === notebookName) {
                notebook.registeredModel = '';
                notebook.mlPlatform = '';
                notebook.testDataset = '';
                notebook.testDatasetKey = '';
                notebook.metrics = [];
            }
        }
        projectSettings['notebooks'] = notebookList;
        /**
         * update the selected models list.
        */
        if (selectedModels.indexOf(notebookName) !== -1) {
            const index = selectedModels.indexOf(notebookName, 0);
            if (index !== -1) {
                selectedModels.splice(index, 1);
                projectSettings['selectedModels'] = selectedModels;
                dispatch({ type: 'SELECTED_MODELS_VISUAL', payload: selectedModels });
            }
        }
        for (let res of resources) {
            if (res.delete) {
                switch (res.key) {
                    case 'name':
                        const cohortIndex = selectedCohorts.indexOf(res.name, 0);
                        if (cohortIndex !== -1) {
                            selectedCohorts.splice(cohortIndex, 1);
                            projectSettings['selectedCohorts'] = selectedCohorts;
                            dispatch({ type: 'SELECTED_COHORTS_VISUAL', payload: selectedCohorts });
                        }
                        await updateDatasetSettings(res);
                        break;
                    default:
                        break;
                }
            }
        }
    }
    /**
     * 
     * @param notebookName 
     * @param _utils 
     * @returns 
     */
    const _updateProjectSettings = async (notebookName: string, _utils: Utils) => {
        return _utils.UpdateProjectSettings(projectSettings, undefined, undefined, undefined, undefined, undefined, undefined, notebookList, notebookName)
            .then(response => {
                return response;
            })
            .catch((error: Error) => {
                console.log("Unregister notebook update settings error:" + error.message);
            });
    }
    /**
     * Unregister the selected model.
     * @param event 
     * @param item 
    */
    const unregisterModel = async (event: any) => {
        const _utils = new Utils();
        let strId = event.currentTarget.id;
        const notebookName = strId?.slice(strId?.lastIndexOf('_') + 1);
        const projectDir = PathExt.join(WORKSPACE_DIR, projectSettings.name);
        const notebookPath = PathExt.join(projectDir, ARTIFACTS_DIR, notebookName);
        /**
         * Identify the resources that should be delete it.
        */
        let resources = await _utils.identifyResources(notebookList, notebookName);

        /**
         * Delete the notebook resources.
        */
        const success = await _utils.deleteNotebookResources(projectSettings.name, resources, notebookPath, true);
        if (success) {
            await updateNotebookSettings(resources, notebookName);
            /**
             * Resources are deleted. Notebooks and datasets settings state are updated. Update the project settings.
            */
            _updateProjectSettings(notebookName, _utils).then(content => {
                if (content) {
                    dispatch({ type: 'PROJECT_SETTINGS', payload: projectSettings });
                }
                else {
                    //todo: raise an error
                }
                //setWaitSpinner(false);
            }).catch((error: Error) => {
                console.log("Unregister model update error: " + error.message);
                //setWaitSpinner(false);
            });
        } else {
            //setWaitSpinner(false);
            console.log("Failed to delete all notebook resources.")
        }
    }
    /**
     * Build the notebook data.
     * @returns 
    */
    const notebooksData = () => {
        const _utils = new Utils();
        let notebooksArr = [];
        const calloutProps = { gapSpace: 0 };
        for (let i = 0; i < notebookList.length; i++) {
            if (notebookList[i] === undefined || notebookList[i].name === "" || notebookList[i].name.length < 1 || notebookList[i].name === undefined) { continue; }
            notebookData.id = i + 1;
            notebookData.key = notebookList[i].key;
            notebookData.notebookName = notebookList[i].name;
            let tooltipId = 'tooltip1' + i.toString();
            let tooltip2Id = 'tooltip2' + i.toString();
            let displayName = notebookList[i].name;
            if (displayName.length > NOTEBOOK_DISPLAY) {
                displayName = _utils.nbNameDisplay(displayName, NOTEBOOK_DISPLAY);
            }
            notebookData.notebook =
                <TooltipHost content={notebookList[i].name} id={tooltipId} calloutProps={calloutProps} styles={hostStyles}>
                    <a tabIndex={0} onKeyPress={openNotebook} onClick={openNotebook} className="openNotebookLink" id={notebookList[i].name}>
                        {displayName}
                    </a>
                </TooltipHost>
            if (notebookList[i].registeredModel) {
                notebookData.registeredModel = true;
                notebookData.model =
                    <TooltipHost content='Edit your model registration' id={tooltip2Id} calloutProps={calloutProps} styles={hostStyles}>
                        <a tabIndex={0}  onKeyPress={editModelRegistration} onClick={editModelRegistration} className="registerLink" id={`editModelRegistration_` + notebookList[i].key} >
                            <FontIcon aria-label="SkypeCircleCheck" iconName="SkypeCircleCheck" className="modelRegisteredIcon" />
                        </a>
                    </TooltipHost>
            }
            else {
                notebookData.registeredModel = false;
                notebookData.model =
                    <TooltipHost content='Register your model' id={tooltip2Id} calloutProps={calloutProps} styles={hostStyles}>
                        <a tabIndex={0} onKeyPress={registerModel} onClick={registerModel} className="registerLink" id={`registerModel_` + notebookList[i].key}>
                            Register
                        </a>
                    </TooltipHost>
            }
            let metrics = notebookList[i].metrics;
            if (metrics !== undefined) {
                let isValid = false;
                let metricValue = 0
                for (let l in metrics) {
                    for (let r in metrics[l].metrics) {
                        if (metrics[l].metrics[r].key.toLowerCase()  === majorMetric.toLowerCase()) {
                            isValid = true;
                            if(metrics[l].name === notebookList[i].testDataset){
                                metricValue = metrics[l].metrics[r].value;
                            }
                        }
                    }
                }
                for (let l in metrics) {
                    if (metrics[l].key === notebookList[i].testDatasetKey && metrics[l].name === notebookList[i].testDataset) {
                        for (let r in metrics[l].metrics) {
                            if (metrics[l].metrics[r].key.toLowerCase() === majorMetric.toLowerCase()) {
                                isValid = true;
                                metricValue = metrics[l].metrics[r].value;
                            }
                        }
                    }
                }
                notebookData.accuracy = _utils.trimDisplayMetric(metricValue, METRICS_ROUND_NUM).toString();

                if (!isValid) {
                    notebookData.accuracy = '-';
                }
                if(metricValue === -99){
                    notebookData.accuracy = '-';
                }
            }
            else {
                notebookData.accuracy = '-';
            }
            notebooksArr.push(notebookData);
            notebookData = {} as INotebookRecordType;
        }
        return notebooksArr
    }
    let notebooks = notebooksData();
    return (
        <div>
            <ActiveProjectData children={notebooks} />
            <NewProjectModal />
            <ModelRegistration />
            <EditModelRegistration />
            <OpenProject />
            <ImportNotebook />
            <PropertiesModal />
            <DeleteNotebook children={notebookInfo} />
            <DeleteProject />
            <ConfirmDelete />
        </div>
    );
}