// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React from 'react';
import { useState, useEffect } from 'react';
import { PathExt } from '@jupyterlab/coreutils';
import { Label } from '@fluentui/react/lib/Label';
import { FontIcon } from '@fluentui/react/lib/Icon';
import { useSelector, useDispatch } from 'react-redux';
import { Checkbox, ICheckboxStyles } from '@fluentui/react';
import { Modal, IStackTokens, Stack, IModal } from '@fluentui/react';
import { DefaultButton, PrimaryButton } from '@fluentui/react/lib/Button';
import { TextField, ITextFieldStyles } from '@fluentui/react/lib/TextField';
import { LargeDatasetInfoTooltip, RegisterModelInfoTooltip } from '../../menus/tooltips';
import { Dropdown, IDropdown, IDropdownStyles, IDropdownOption } from '@fluentui/react/lib/Dropdown';
import '../../../../style/modals.css';
import { Utils } from '../../../core/utils';
import { IDatasetType, IFeatureValuesType } from '../../../core/components';

export const EditModelRegistration = () => {
    const WORKSPACE_DIR = 'workspace';
    const ARTIFACTS_DIR = 'artifacts';
    /**
     * App state.
    */
    const titleId = 'modelRegistrationModal';
    const dispatch = useDispatch();
    const state = useSelector((state) => state);
    const mlPlatforms = state['mlPlatforms'];
    const showEditModal = state['editModelRegistrationModalState'];
    const projectSettings = state['projectSettings'];
    let datasets = projectSettings['datasets'];
    let notebooks = projectSettings['notebooks'];
    let selectedModels = projectSettings['selectedModels'];
    let selectedCohorts = projectSettings['selectedCohorts'];
    const datasetLabelRef = React.createRef<IDropdown>();
    const stackTokens: IStackTokens = { childrenGap: 15 };
    const ModalRef = React.createRef<IModal>();
    const mlPlatformRef = React.createRef<IDropdown>();
    const separatorRef = React.createRef<IDropdown>();
    interface IModelReg {
        notebookName: string,
        modelName: string;
        mlPlatform: IDropdownOption,
        testDataset: string;
        header: boolean;
        separator: IDropdownOption,
        label: IDropdownOption,
    }
    /**
     * Ml platform options.
    */
    const optionMlPlatforms: IDropdownOption[] = [];
    for (let i = 0; i < mlPlatforms!.length; i++) {
        optionMlPlatforms.push({ key: mlPlatforms[i]['value'], text: mlPlatforms[i]['value'] });
    }
    let fOptions: IDropdownOption[] = [];
    let [featureOptions, setFeatureOptions] = useState(fOptions);
    let _notebookId = state['inEditNotebookId'];
    const notebookId = _notebookId?.slice(_notebookId?.lastIndexOf('_') + 1);
    let notebook: any;
    for (let ent of state['projectSettings']["notebooks"]) {
        if (ent.key === notebookId) {
            notebook = ent;
        }
    }

    let [modelRegInfo, setModelRegInfo] = useState<IModelReg>();
    /**
     * Edit registration default values.
    */
    const updateEditDatasetFields = (_modelRegInfo: IModelReg): void => {
        let editDb = false;
        if (datasets?.length !== 0) {
            let ent = {} as IDatasetType;
            for (let db of datasets) {
                if (db && db?.name?.toLowerCase() === _modelRegInfo?.testDataset?.toLowerCase()) {
                    editDb = true;
                    for (let f in db.features) {
                        fOptions.push({ key: f, text: db.features[f] });
                    }
                    ent.key = db.key;
                    ent.name = db.name;
                    ent.masterKey = db.masterKey;
                    ent.masterName = db.masterName;
                    ent.labelIndex = db.labelIndex;
                    ent.label = db.label;
                    ent.features = db.features;
                    ent.isCohort = db.isCohort;
                    ent.separator = db.separator;
                    ent.header = db.header;
                    ent.filterValuesList = db.filterValuesList;
                    break;
                }
            }
            if (editDb) {
                setFeatureOptions(fOptions);
                _modelRegInfo.header = ent.header;
                _modelRegInfo.label = { key: ent?.labelIndex?.toString(), text: ent?.label };
                if (ent.separator === 'comma') {
                    _modelRegInfo.separator = { key: 'comma', text: 'Comma delimited' };
                } else {
                    _modelRegInfo.separator = { key: 'tab', text: 'Tab delimited' };
                }
                setModelRegInfo(_modelRegInfo);
            }
        }
    }

    const modelInfoDiff = async (): Promise<boolean> => {
        if (!modelRegInfo) { return true; }
        for (let i in modelRegInfo) {
            const info = modelRegInfo[i];
            if (info.notebookName !== notebook['name'] ||
                info.mlPlatform.key !== notebook['mlPlatform'] ||
                info.testDataset !== notebook['testDataset'] ||
                info.registeredModel !== notebook['registeredModel']) {
                return true;
            }
        }
        return false;
    }

    useEffect(() => {
        let isMounted = true;
        if (isMounted) {
            if (notebook) {
                modelInfoDiff().then(resp => {
                    if (resp === true) {
                        let _modelRegInfo = {} as IModelReg;
                        _modelRegInfo.notebookName = notebook['name'];
                        _modelRegInfo.mlPlatform = { key: notebook['mlPlatform'], text: notebook['mlPlatform'] };
                        _modelRegInfo.testDataset = notebook['testDataset'];
                        _modelRegInfo.modelName = notebook['registeredModel'];
                        updateEditDatasetFields(_modelRegInfo);
                    }
                });
            }
        }
        return () => {
            isMounted = false;
        }
    }, [notebook]);

    useEffect(() => {
        let isMounted = true;
        if (isMounted) {
            if (notebook) {
                if (!modelRegInfo) {
                    let _modelRegInfo = {} as IModelReg;
                    _modelRegInfo.notebookName = notebook['name'];
                    _modelRegInfo.mlPlatform = { key: notebook['mlPlatform'], text: notebook['mlPlatform'] };
                    _modelRegInfo.testDataset = notebook['testDataset'];
                    _modelRegInfo.modelName = notebook['registeredModel'];
                    updateEditDatasetFields(_modelRegInfo);
                }
                modelInfoDiff().then(resp => {
                    if (resp === true) {
                        let _modelRegInfo = {} as IModelReg;
                        _modelRegInfo.notebookName = notebook['name'];
                        _modelRegInfo.mlPlatform = { key: notebook['mlPlatform'], text: notebook['mlPlatform'] };
                        _modelRegInfo.testDataset = notebook['testDataset'];
                        _modelRegInfo.modelName = notebook['registeredModel'];
                        updateEditDatasetFields(_modelRegInfo);
                    }
                }).catch((error: Error) => {
                    console.log("Checking model difference exception:" + error.message);
                });
            }
        }
        return () => {
            isMounted = false;
        }
    }, []);

    /**
     * Support for comma and tab separators.
    */
    const optionSeparator: IDropdownOption[] = [];
    optionSeparator.push({ key: 'comma', text: 'Comma delimited' });
    optionSeparator.push({ key: 'tab', text: 'Tab delimited' });
    const checkboxStyle: Partial<ICheckboxStyles> = { root: { marginBottom: 5, marginTop: 10 } };
    /**
     * Fluent inline style, and app refs.
     */
    const dropdownStyles: Partial<IDropdownStyles> = {
        root: { padding: '10px 0px 10px 0px' },
        dropdown: { width: 250, height: 32 },
        dropdownOptionText: { overflow: 'visible', whiteSpace: 'normal' },
        dropdownItem: { height: 'auto' },
    };
    const dropdownDatasetStyles: Partial<IDropdownStyles> = {
        root: { padding: '10px 0px 0px 0px' },
        dropdown: { width: 250, height: 32 },
        dropdownOptionText: { overflow: 'visible', whiteSpace: 'normal' },
        dropdownItem: { height: 'auto' },
    };

    const dropdownSeparatorStyles: Partial<IDropdownStyles> = {
        root: { padding: '0px 0px 0px 0px' },
        dropdown: { width: 250, height: 32 },
        dropdownOptionText: { overflow: 'visible', whiteSpace: 'normal' },
        dropdownItem: { height: 'auto' },
    };
    /**
     * Fluent built-in style options.
    */
    const regModelStyle: Partial<ITextFieldStyles> = {
        fieldGroup: { width: 140, height: 32, alignContent: 'center', textAlign: 'center' }
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
    * @param notebookName 
    * @param _utils 
    * @returns 
    */
    const _updateProjectSettings = async (notebookName: string, _utils: Utils) => {
        return _utils.UpdateProjectSettings(projectSettings, undefined, undefined, undefined, undefined, undefined, undefined, notebooks, notebookName)
            .then(response => {
                return response;
            })
            .catch((error: Error) => {
                console.log("Unregister notebook update settings error:" + error.message);
            });
    }
    /**
    * 
    * @param resources 
   */
    const updateNotebookSettings = async (resources: any[], notebookName: string) => {
        for (let notebook of notebooks) {
            if (notebook.name === notebookName) {
                notebook.registeredModel = '';
                notebook.mlPlatform = '';
                notebook.testDataset = '';
                notebook.testDatasetKey = '';
                notebook.metrics = [];
            }
        }
        projectSettings['notebooks'] = notebooks;
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
     * @param event 
    */
    const unregisterModel = async (event: any) => {
        const _utils = new Utils();
        const notebookName = modelRegInfo.notebookName;//localStorage.getItem('notebookName');
        const projectDir = PathExt.join(WORKSPACE_DIR, projectSettings.name);
        const notebookPath = PathExt.join(projectDir, ARTIFACTS_DIR, notebookName);
        /**
         * Identify the resources that should be delete it.
        */
        let resources = await _utils.identifyResources(notebooks, notebookName);

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
                    dispatch({ type: 'EDIT_MODEL_REGISTRATION_MODAL_STATE', payload: false });
                }
                else {
                    //todo: raise an error
                    console.log('Update project settings failed.');
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

    const handleClose = () => {
        dispatch({ type: 'EDIT_MODEL_REGISTRATION_MODAL_STATE', payload: false });
    }

    return (
        <>
            <Modal
                titleAriaId={titleId}
                isOpen={showEditModal}
                onDismiss={handleClose}
                componentRef={ModalRef}
            >
                <div className='modalRegisterModel'>
                    <form id='frmEditRegisterModel' noValidate >
                        <div className='modalFluentHeader'>
                            <Label className='registerModelHeader'>Model registration</Label>
                            <RegisterModelInfoTooltip /><FontIcon aria-label="Cancel" iconName="Cancel" id='cancelIcon' className='cancelIconStyles' onClick={handleClose} />
                        </div>
                        <div>
                            <table className='modalFluentBody'>
                                <tbody>
                                    <tr><td colSpan={3}>&nbsp;</td></tr>
                                    <tr>
                                        <td id='propR11'>
                                            <Label className='registerModelLabelText'>Model object:</Label>
                                        </td>
                                        <td id='propR21'>
                                            <TextField
                                                required
                                                id='modelName'
                                                styles={regModelStyle}
                                                placeholder='Select File'
                                                disabled
                                            />
                                        </td>
                                        <td id='propR31'>
                                            <span>&nbsp;{modelRegInfo?.modelName}</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <Label className='registerModelLabelText'>ML platform:</Label>
                                        </td>
                                        <td colSpan={2}>
                                            <Dropdown
                                                defaultSelectedKey={modelRegInfo?.mlPlatform?.text ? modelRegInfo?.mlPlatform?.key : undefined}
                                                componentRef={mlPlatformRef}
                                                id='MlPlatform'
                                                placeholder="Select an option"
                                                options={optionMlPlatforms}
                                                styles={dropdownStyles}
                                                required
                                                disabled
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td id='propR13'>
                                            <Label className='registerModelLabelText'>Test dataset<LargeDatasetInfoTooltip />:</Label>
                                        </td>
                                        <td id='propR23'>
                                            <TextField
                                                required
                                                id='datasetName'
                                                styles={regModelStyle}
                                                placeholder='Select File '
                                                disabled
                                            />
                                        </td>
                                        <td id='propR33'>
                                            <span>&nbsp;{modelRegInfo?.testDataset}</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>&nbsp;</td>
                                        <td colSpan={2}>
                                            <Stack tokens={stackTokens} horizontal>
                                                <Checkbox disabled id="headerCheckbox" label="Has header" styles={checkboxStyle} checked={modelRegInfo?.header} />
                                            </Stack>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <Label className='registerModelLabelText'>Separator:</Label>
                                        </td>
                                        <td colSpan={2}>
                                            <Dropdown
                                                defaultSelectedKey={modelRegInfo?.separator?.text ? modelRegInfo?.separator?.key : undefined}
                                                componentRef={separatorRef}
                                                id='datasetSeparator'
                                                placeholder="Select an option"
                                                options={optionSeparator}
                                                styles={dropdownSeparatorStyles}
                                                required
                                                disabled
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <Label className='registerModelLabelText'>Dataset label:</Label>
                                        </td>
                                        <td colSpan={2}>
                                            <Dropdown
                                                defaultSelectedKey={modelRegInfo?.label?.text ? modelRegInfo?.label?.key : undefined}
                                                componentRef={datasetLabelRef}
                                                id='datasetLabel'
                                                placeholder="Select an option"
                                                options={featureOptions}
                                                styles={dropdownDatasetStyles}
                                                required
                                                disabled

                                            />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className='modalFluentFooter'>
                            <Stack horizontal tokens={stackTokens}>
                                <PrimaryButton secondaryText="Unregister your Model" text="Unregister" onClick={unregisterModel} />
                                <DefaultButton onClick={handleClose} text="Cancel" />
                            </Stack>
                        </div>
                    </form>
                </div>

            </Modal >
        </>
    );
}


