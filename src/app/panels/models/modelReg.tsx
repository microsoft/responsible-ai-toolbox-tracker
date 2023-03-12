// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { UUID } from 'angular2-uuid';
import React, { useState } from 'react';
import { PathExt } from '@jupyterlab/coreutils';
import { Contents } from '@jupyterlab/services';
import { Label } from '@fluentui/react/lib/Label';
import { FontIcon } from '@fluentui/react/lib/Icon';
import { UploadUtil } from '../../../core/uploadUtil';
import { useSelector, useDispatch } from 'react-redux';
import { Checkbox, ICheckboxStyles } from '@fluentui/react';
import { Spinner, SpinnerSize } from '@fluentui/react/lib/Spinner';
import { Modal, IStackTokens, Stack, IModal } from '@fluentui/react';
import { DefaultButton, PrimaryButton } from '@fluentui/react/lib/Button';
import { LargeDatasetInfoTooltip, RegisterModelInfoTooltip } from '../../menus/tooltips';
import { Dropdown, IDropdown, IDropdownStyles, IDropdownOption } from '@fluentui/react/lib/Dropdown';
import '../../../../style/modals.css';
import { Utils } from '../../../core/utils';
import { IFilter } from "../cohorts/cohortTypes";
import { RegisterModel } from '../../../core/mlflowUtils';
import { IDatasetType, IFeatureValuesType } from '../../../core/components';

export const ModelRegistration = () => {
    const ARTIFACTS_DIR = 'artifacts';
    const PLATFORM_REQUIRED = "Selecting the platform is a requirement.";
    const DATASET_REQUIRED = "Selecting a test dataset is a requirement.";
    const MODEL_REQUIRED = "Selecting your trained model is a requirement.";
    const LABEL_REQUIRED = "Selecting the test dataset label is a requirement.";
    const SEPARATOR_REQUIRED = "Selecting the dataset separator is a requirement.";
    const LABEL_CATEGORICAL = "Categorical labels are not supported.  Please convert your labels to numeric, and try again.";
    const REGISTER_EXP = "Registering a model to a notebook assigns the model as the notebook's representative model comparison.";
    /**
     * File state.
    */
    const dispatch = useDispatch();
    const state = useSelector((state) => state);
    const projectSettings = state['projectSettings'];
    const mlPlatforms = state['mlPlatforms'];
    const projectName = projectSettings['name'];
    const datasets = projectSettings['datasets'];
    const problemType = projectSettings['problemType'];
    let selectedModels = projectSettings['selectedModels'];
    const showModal = state['modelRegistrationModalState'];
    let [datasetName, setDatasetName] = useState('');
    let [modelName, setModelNameValue] = useState('');
    let [waitSpinner, setWaitSpinner] = useState(false);
    const [mlFlowModelError, setMlFlowModelError] = useState('');
    const [mlPlatformError, setMlPlatformError] = useState('');
    const [datasetLabelError, setDatasetLabelError] = useState('');
    let [DatasetLabelHidden, setDatasetLabelHidden] = useState(true);
    let [datasetHeader, setDatasetHeader] = React.useState(false);
    let [uploadModelErrorHidden, setUploadModelErrorHidden] = useState(true);
    let [registerModelValidated, setRegisterModelValidated] = useState(false);
    let [uploadDatasetValidated, setUploadDatasetValidated] = useState(false);
    let [datasetLabelValidated, setDatasetLabelValidated] = useState(false);
    let [registeredDatasetMessageHidden, setRegisteredDatasetMessageHidden] = useState(true);
    let [uploadDatasetErrorHidden, setUploadDatasetErrorHidden] = useState(true);
    const [registerModelError, setRegisterModelError] = useState(MODEL_REQUIRED);
    const [uploadDatasetError, setUploadDatasetError] = useState(DATASET_REQUIRED);
    const [registeredDatasetMessage, setRegisteredDatasetMessage] = useState(DATASET_REQUIRED);
    let [preRegisteredDisabled, setPreRegisteredDisabled] = useState(false);
    let [mlPlatformSelected, setMlPlatformSelected] = useState<IDropdownOption>();
    let [datasetLabelSelected, setDatasetLabelSelected] = useState<IDropdownOption>();
    let [dbFiles, setDbFiles] = useState<File[]>();
    let [modelFiles, setModelFiles] = useState<File[]>();
    /**
     * Fluent inline style, and file refs.
    */
    const titleId = 'modelRegistrationModal';
    const ModalRef = React.createRef<IModal>();
    const separatorRef = React.createRef<IDropdown>();
    const mlPlatformRef = React.createRef<IDropdown>();
    const datasetLabelRef = React.createRef<IDropdown>();
    const stackTokens: IStackTokens = { childrenGap: 15 };
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
    const checkboxStyle: Partial<ICheckboxStyles> = { root: { marginBottom: 5, marginTop: 5 } };
    /**
     * Ml platform options.
    */
    const optionMlPlatforms: IDropdownOption[] = [];
    for (let i = 0; i < mlPlatforms!.length; i++) {
        optionMlPlatforms.push({ key: mlPlatforms[i]['value'], text: mlPlatforms[i]['value'] });
    }
    let fOptions: IDropdownOption[] = [];
    let [featureOptions, setFeatureOptions] = useState(fOptions);
    let datasetOb: IDatasetType;
    let [datasetEntity, setDatasetEntity] = useState(datasetOb);
    /**
      * Support for comma and tab separators.
    */
    const optionSeparator: IDropdownOption[] = [];
    optionSeparator.push({ key: 'Select an option', text: 'Select an option', hidden: true });
    optionSeparator.push({ key: 'comma', text: 'Comma delimited' });
    optionSeparator.push({ key: 'tab', text: 'Tab delimited' });
    const [separatorError, setSeparatorError] = useState('');
    let [separatorSelected, setSeparatorSelected] = useState<IDropdownOption<any>>();
    /**
     * Separator function to update user's preference.
     * @param event 
     * @param option 
     * @param index 
    */
    const updateSeparator = (event, option, index) => {
        setSeparatorSelected(option);
        setSeparatorError('');
        setDatasetLabelError('');
        if (datasetName && datasetName.length > 0) {
            updateDatasetFields(dbFiles, option, datasetHeader);
            setDatasetLabelHidden(false);
        }
    }

    let notebookName: string;
    let mlFlowRunId: string;
    let _notebookId = state['inRegisterNotebookId'];
    const notebookId = _notebookId?.slice(_notebookId?.lastIndexOf('_') + 1);
    let notebook: any;
    for(let ent of state['projectSettings']["notebooks"]){        
        if(ent.key === notebookId){
            notebook = ent;
        }          
    }

    if (notebook) {
        notebookName = notebook['name'];
        mlFlowRunId = notebook['mlFlowRunId'];
    }
    /**
     * the model name being uploaded
    */
    const uploadFileChange = (event: any) => {
        let files = event.target.files;
        if (files !== 0) {
            setModelNameValue(files[0]?.name)
            setRegisterModelValidated(true);
            setUploadModelErrorHidden(true)
            setRegisterModelError('');
            setMlFlowModelError('');
            setModelFiles(files);
        }
    }
    const getSeparator = (separatorOptions: any): string => {
        if (separatorOptions?.key === 'comma') {
            return ',';
        } else {
            return '\t';
        }
    }
    /**
     *
     * @param files
     * @returns
    */
    const updateDatasetFields = async (files: any, separatorOptions: any, header: boolean = false): Promise<void> => {
        const _files = Array.prototype.slice.call(files) as File[];
        if (_files.length !== 0) {
            const dataset = _files[0];
            let datasetEntity = {} as IDatasetType;
            let fValuesList: IFeatureValuesType[] = [];
            let _fValues = {} as IFeatureValuesType;
            let fileReader = new FileReader();
            let recordsCount = 0;

            fileReader.onload = (e) => {
                const separator = getSeparator(separatorOptions);
                const lineBreak = '\n';
                let fields: string[];
                let rawValues: string[][];
                if (header) {
                    fields = (fileReader.result as string).replace('\r', '').split(lineBreak).shift().split(separator);
                    rawValues = (fileReader.result as string).split(lineBreak).map(s => s.replace('\r', '').split(separator)).slice(1).filter(value => value.length >= fields.length);
                } else {
                    fields = [];
                    let fieldLength = (fileReader.result as string).replace('\r', '').split(lineBreak).shift().split(separator).length;
                    for (let i = 0; i < fieldLength; i++) {
                        fields.push(i.toString());
                    }
                    rawValues = (fileReader.result as string).split(lineBreak).map(s => s.replace('\r', '').split(separator)).filter(value => value.length >= fields.length);
                }
                recordsCount = rawValues.length;
                fOptions = [];
                fOptions.push({ key: "Select an option", text: "Select an option", hidden: true });
                for (let f in fields) {
                    fOptions.push({ key: f, text: fields[f] });
                    if (fields[f] === datasetEntity.label) {
                        continue;
                    }
                    _fValues.key = UUID.UUID();
                    _fValues.name = fields[f];
                    _fValues.values = rawValues.map(row => row[f]);
                    fValuesList.push(_fValues);
                    _fValues = {} as IFeatureValuesType;
                }
                setFeatureOptions(fOptions);
                datasetEntity.features = fields;
                datasetEntity.featuresValues = fValuesList;
                datasetEntity.recordsCount = recordsCount;
                setDatasetEntity(datasetEntity);
            }
            fileReader.readAsText(dataset, 'utf8');
        }
    }
    /**
     * 
     * @param label 
     * @param header 
     * @param separator 
     * @returns 
    */
    const isDbPropertyValid = (label: string = undefined, header: boolean = undefined, separator: string = undefined): boolean => {
        if (datasets?.length !== 0) {
            for (let db of datasets) {
                if (db && db.name.toLowerCase() === datasetName.toLowerCase()) {
                    if (label) {
                        if (db.label !== label) {
                            return false;
                        } else {
                            return true;
                        }
                    }
                    if (header !== undefined) {
                        if (db.header !== header) {
                            return false;
                        } else {
                            return true;
                        }
                    }
                    if (separator) {
                        if (db.separator !== separator) {
                            return false;
                        } else {
                            return true;
                        }
                    }
                    break;
                }
            }
        } else {
            /**
             * a new dataset.  always valid.
            */
            return true;
        }
        return true;
    }
    /**
     * 
     * @param dbName 
     * @returns 
    */
    const datasetRegistered = (files: any) => {
        const dbName = files[0].name;
        let existingDb = false;
        if (datasets?.length !== 0) {
            let ent = {} as IDatasetType;
            for (let db of datasets) {
                if (db && db.name.toLowerCase() === dbName.toLowerCase()) {
                    existingDb = true;
                    ent.labelIndex = db.labelIndex;
                    ent.label = db.label;
                    ent.separator = db.separator;
                    ent.header = db.header;
                    fOptions = [];
                    fOptions.push({ key: "Select an option", text: "Select an option", hidden: true });
                    for (let f in db.features) {
                        fOptions.push({ key: f, text: db.features[f] });
                    }
                    setFeatureOptions(fOptions);
                    break;
                }
            }
            if (existingDb) {
                let option: any;
                if (ent.separator === 'comma') {
                    setSeparatorSelected({ key: 'comma', text: 'Comma delimited' });
                    option = { key: 'comma', text: 'Comma delimited' };
                } else {
                    setSeparatorSelected({ key: 'tab', text: 'Tab delimited' });
                    option = { key: 'tab', text: 'Tab delimited' };
                }
                setPreRegisteredDisabled(true);
                setUploadDatasetErrorHidden(true);
                setDatasetLabelHidden(false);
                setUploadDatasetError('');
                setRegisteredDatasetMessageHidden(false);
                setRegisteredDatasetMessage('Test dataset previously registered');
                setDatasetHeader(ent.header);
                updateDatasetFields(files, option, ent.header);
                setDatasetLabelSelected({ key: ent?.labelIndex.toString(), text: ent?.label });
            } else {
                setDatasetHeader(false);
                setDatasetLabelHidden(true);
                setSeparatorSelected({ key: 'Select an option', text: 'Select an option', hidden: false });
                setDatasetLabelSelected({ key: 'Select an option', text: 'Select an option', hidden: false });
                setPreRegisteredDisabled(false);
                setUploadDatasetErrorHidden(true);
                setRegisteredDatasetMessageHidden(true);
                setRegisteredDatasetMessage('');
                setUploadDatasetError('');
            }
        }
    }
    /**
     * Identify the dataset settings
    */
    const uploadDatasetChange = (event): void => {
        let files = event.target.files;
        if (files.length !== 0) {
            datasetRegistered(files);
            setSeparatorError('');
            setDatasetLabelError('');
            setDatasetName(files[0].name);
            setUploadDatasetValidated(true);
            setDatasetLabelValidated(true);
            setDbFiles(files);
        }
    }
    /**
     * 
     * @param datasetEntity 
     * @returns 
    */
    const _updateDatasetEntity = async (datasetEntity: IDatasetType) => {
        const _utils = new Utils();
        return _utils.saveCohortsData(datasetEntity, projectName)
            .then(response => {
                return response;
            })
            .catch((error: Error) => {
                return false;
            });
    }
    /**
     * Identify if a string cannot be parse to a numeric value
     * @param str 
     * @returns A boolean flag
    */
    const notNumeric = (str: string) => {
        var numericR = parseFloat(str);
        return isNaN(numericR) || numericR.toString().length != str.length;
    }
    /**
     *  Verify the label value is numeric.
     * @param labelIndex 
     * @returns 
    */
    const verifyLabelData = (option: IDropdownOption) => {
        if (datasetEntity && datasetEntity?.features.length > 1) {
            let labels = datasetEntity.featuresValues[option.key];
            if (labels && labels.values && labels.values.length > 0) {
                for (let i in labels.values) {
                    const v = labels.values[i];
                    if (notNumeric(v.toString())) {
                        return false;
                    }
                    else {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    /**
    * Dataset label update.
    * @param event 
    * @param option 
    * @param index 
    */
    const updateLabel = (event, option, index) => {
        if (!verifyLabelData(option)) {
            setDatasetLabelError(LABEL_CATEGORICAL);
            setDatasetLabelValidated(false);

        }
        else {
            setDatasetLabelValidated(true);
            dispatch({ type: 'SELECTED_DATASET_LABEL', payload: option });
            setDatasetLabelSelected(option);
            datasetEntity.labelIndex = Number(option.key);
            datasetEntity.label = option.text;
            setDatasetEntity(datasetEntity);
            setDatasetLabelError('');
        }
    }
    const updateMlPlatform = (event, option, index) => {
        notebook['mlPlatform'] = option.text;
        dispatch({ type: 'SELECTED_ML_PLATFORM', payload: notebook });
        setMlPlatformSelected(option);
        setMlPlatformError('');
    }
    const _onInputModelChanged = async (file: File) => {
        const _uploadUtil = new UploadUtil();
        return _uploadUtil.UploadFile(file, projectName, ARTIFACTS_DIR)
            .then(response => {
                return response;
            })
            .catch((error: Error) => {
                return false;
            });
    }
    const _onInputDatasetChanged = async (file: File) => {
        const _uploadUtil = new UploadUtil();
        return _uploadUtil.UploadFile(file, projectName, ARTIFACTS_DIR)
            .then(response => {
                return response;
            })
            .catch((error: Error) => {
                return false;
            });
    }
    const datasetHeaderChange = React.useCallback(
        (ev?: React.FormEvent<HTMLElement | HTMLInputElement>, checked?: boolean): void => {
            setDatasetHeader(!!checked);
            setSeparatorSelected({ key: 'Select an option', text: 'Select an option', hidden: false });
            setDatasetLabelHidden(true);
        },
        [],
    );
    const saveRegisteredModelSettings = async (notebookName: string, registeredModel: string, dataset: string, metricsList: any,
        mlPlatformSelected: string, addDataset: boolean, datasetHeader: boolean, separator: string): Promise<Contents.IModel> => {
        const _utils = new Utils();
        return _utils.SaveRegisteredModelSettings(projectSettings, notebookName, registeredModel, dataset, metricsList,
            mlPlatformSelected, datasetEntity, addDataset, selectedModels, datasetHeader, separator)
            .then(response => {
                return response;
            })
            .catch((error: Error) => {
                console.log(error.message);
                return undefined;
            });
    }
    /**
     * 
     * @param modelName 
     * @param testDataName 
     * @param testDataTarget 
     * @param mlPlatformSelected 
     * @param header 
     * @param separator 
     * @returns 
    */
    const verifyRegistration = async (modelName: string, testDataName: string, testDataTarget: string, mlPlatformSelected: string, header: boolean, separator: string) => {
        const artifactsDir = 'artifacts';
        const workspace = 'workspace';
        let addDataset = true;
        const modelPath = PathExt.join(workspace, projectName, artifactsDir, modelName).normalize();
        const datasetPath = PathExt.join(workspace, projectName, artifactsDir, testDataName).normalize();

        let _metricsList = await RegisterModel(projectSettings, mlFlowRunId, modelPath, datasetPath, testDataTarget, mlPlatformSelected,
            header, separator, problemType, notebookName, undefined, undefined, undefined);
        let metricsList = await _metricsList;
        if (Object.keys(metricsList).length !== 0) {
            setWaitSpinner(false);
            /**
             * Update the cohort file.
             */
            let dateTime = new Date();
            datasetEntity.name = datasetName;
            datasetEntity.isCohort = false;
            let filterList: IFilter[] = [];
            datasetEntity.filterValuesList = filterList;
            datasetEntity.dateCreated = dateTime.toLocaleDateString();
            datasetEntity.lastUpdated = dateTime.toLocaleDateString()
            datasetEntity.registeredModel = modelName;
            datasetEntity.mlPlatform = mlPlatformSelected;
            datasetEntity.mlFlowRunId = mlFlowRunId;
            datasetEntity.header = header;
            datasetEntity.separator = separator;
            for (let i = 0; i < projectSettings['datasets'].length; i++) {
                if (projectSettings['datasets'][i].name.toLowerCase() === datasetEntity?.name.toLowerCase()) {
                    addDataset = false;
                    datasetEntity.key = projectSettings['datasets'][i].key;
                    datasetEntity.masterKey = projectSettings['datasets'][i].masterKey;
                    datasetEntity.masterName = projectSettings['datasets'][i].masterName;
                }
            }
            /**
            * update the dataset entity
           */
            if (addDataset) {
                datasetEntity.key = UUID.UUID();
                datasetEntity.masterKey = datasetEntity.key;
                datasetEntity.masterName = datasetEntity.name;
            }
            /**
             * update the project model registration settings.
            */
            saveRegisteredModelSettings(notebookName, modelName, datasetName, metricsList, mlPlatformSelected, addDataset, header, separator).then(content => {
                if (content) {
                    dispatch({ type: 'SELECTED_MODELS_VISUAL', payload: projectSettings['selectedModels'] });
                    dispatch({ type: 'SELECTED_METRICS_VISUAL', payload: projectSettings['selectedMetrics'] });
                    dispatch({ type: 'SELECTED_COHORTS_VISUAL', payload: projectSettings['selectedCohorts'] });
                    dispatch({ type: 'PROJECT_PROPERTIES_STATE', payload: projectSettings });


                    /**
                     * 
                    */
                    if (!datasetEntity?.label) {
                        datasetEntity.label = datasetLabelSelected.text;
                        datasetEntity.labelIndex = Number(datasetLabelSelected.key);
                    }
                    _updateDatasetEntity(datasetEntity).then(content => {
                        if (content) {
                            dispatch({ type: 'SELECTED_COHORTS_VISUAL', payload: projectSettings['selectedCohorts'] });
                            dispatch({ type: 'MODEL_REGISTRATION_MODAL', payload: projectSettings });
                        }
                    });
                }
            });
            /**
             * reset state.
            */
            handleClose();
            return true;
        } else {
            setMlFlowModelError('Model Registration failed');
            setWaitSpinner(false);
            return undefined;
        }
    }
    /**
      * handle the form submit event
    */
    const handleSubmit = async (event) => {
        setMlFlowModelError('');
        const current_event = event.currentTarget;
        if (!registerModelValidated || !uploadDatasetValidated || !datasetLabelValidated || !datasetLabelSelected
            || datasetLabelSelected?.text?.length === 0 || !mlPlatformSelected || mlPlatformSelected?.text?.length === 0
            || !separatorSelected || separatorSelected?.text?.length === 0) {
            if (current_event.upload_model.value === '') {
                setRegisterModelError(MODEL_REQUIRED);
                setUploadModelErrorHidden(false);
            }
            else {
                setUploadModelErrorHidden(true);
                setRegisterModelError('');
            }
            if (current_event.upload_dataset.value === '') {
                setUploadDatasetError(DATASET_REQUIRED);
                setUploadDatasetErrorHidden(false);
            }
            else {
                setUploadDatasetErrorHidden(true);
                setUploadDatasetError('');
            }
            if (mlPlatformRef.current.selectedOptions.length === 0) {
                setMlPlatformError(PLATFORM_REQUIRED);
            }
            else {
                setMlPlatformError('');
            }
            if (separatorRef.current.selectedOptions.length === 0) {
                setSeparatorError(SEPARATOR_REQUIRED);
            }
            else {
                setSeparatorError('');
            }
            if (!DatasetLabelHidden) {
                if (datasetLabelRef.current.selectedOptions.length === 0) {
                    setDatasetLabelError(LABEL_REQUIRED);
                }
                else if (!datasetLabelValidated) {
                    setDatasetLabelError(LABEL_CATEGORICAL);
                }
                else {
                    setDatasetLabelError('');
                }
            }
        }
        else {
            /**
             * Upload a model
            */
            if (!modelFiles) {
                modelFiles = Array.prototype.slice.call(current_event.upload_model.files) as File[];
            }
            /**
             * Upload a test dataset
            */
            if (!dbFiles) {
                dbFiles = Array.prototype.slice.call(current_event.upload_dataset.files) as File[];
            }
            if (modelFiles.length > 0) {
                setWaitSpinner(true);
                const _model = modelFiles[0];
                _onInputModelChanged(_model).then(content => {
                    if (content) {
                        console.warn('Model uploaded successfully');
                        if (dbFiles.length > 0) {
                            const dataset = dbFiles[0];
                            _onInputDatasetChanged(dataset).then(content => {
                                if (content) {
                                    console.warn('Test dataset uploaded successfully');
                                    const sep = separatorSelected.key.toString();
                                    const header = current_event.headerCheckbox.checked;
                                    verifyRegistration(modelName, datasetName, datasetLabelSelected.text, mlPlatformSelected.text, header, sep).then(res => {
                                        if (res) {
                                            console.warn('Model Registration Success');
                                            setWaitSpinner(false);
                                        } else {
                                            setWaitSpinner(false);
                                            setMlFlowModelError('Model Registration failed');
                                        }
                                    }).catch((error: Error) => {
                                        console.log(error.message);
                                        setWaitSpinner(false);
                                        setMlFlowModelError('Model Registration failed');
                                    });
                                }
                            });
                        }
                    }
                });
            }
        }
        event.preventDefault();
        event.stopPropagation();
    }
    const handleClose = () => {
        setModelNameValue('');
        setRegisterModelError('');
        setMlFlowModelError('');
        setUploadModelErrorHidden(true);
        setRegisterModelValidated(false);
        setMlPlatformError('');
        setMlPlatformSelected(undefined);
        setDatasetName('');
        setUploadDatasetError('');
        setUploadDatasetErrorHidden(true);
        setDatasetLabelError('');
        setDatasetLabelHidden(true);
        setRegisteredDatasetMessageHidden(true);
        setRegisteredDatasetMessage('');
        setSeparatorError('');
        setSeparatorSelected(undefined);
        setFeatureOptions(undefined);
        setWaitSpinner(false);
        setPreRegisteredDisabled(false);
        setDatasetHeader(false);
        dispatch({ type: 'MODEL_REGISTRATION_MODAL_STATE', payload: false });
    }
    return (
        <>
            <Modal
                titleAriaId={titleId}
                isOpen={showModal}
                onDismiss={handleClose}
                componentRef={ModalRef}
            >
                <div className='modalRegisterModel'>
                    <form onSubmit={handleSubmit} id='frmRegisterModel' noValidate >
                        <div className='modalFluentHeader'>
                            <Label className='registerModelHeader'>Register a model</Label>
                            <RegisterModelInfoTooltip /><FontIcon aria-label="Cancel" iconName="Cancel" id='cancelIcon' className='cancelIconStyles' onClick={handleClose} />
                        </div>
                        <div>
                            <Label className="registerModelExp">
                                {REGISTER_EXP}
                            </Label>
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
                                            <Stack tokens={stackTokens} className='requiredAsterik' horizontal>
                                                <Label className='labelChooseFile' id="labelUploadModel">
                                                    <span className='spanChooseFile'>Select File</span>
                                                    <input onChange={uploadFileChange} type="file" multiple={true} name='upload_model' placeholder='Upload Model' className='btnUploadFile' />
                                                </Label>
                                            </Stack>
                                        </td>
                                        <td id='propR31'>
                                            <span>&nbsp;{modelName}</span>
                                        </td>
                                    </tr>
                                    <tr hidden={uploadModelErrorHidden}>
                                        <td>&nbsp;</td>
                                        <td className='LabelTextErrorOutput' colSpan={2}><span>{registerModelError}&nbsp;</span></td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <Label className='registerModelLabelText'>ML platform:</Label>
                                        </td>
                                        <td colSpan={2}>
                                            <Dropdown
                                                componentRef={mlPlatformRef}
                                                id='MlPlatform'
                                                placeholder="Select an option"
                                                options={optionMlPlatforms}
                                                styles={dropdownStyles}
                                                onChange={updateMlPlatform}
                                                errorMessage={mlPlatformError}
                                                required
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td id='propR13'>
                                            <Label className='registerModelLabelText'>Test dataset<LargeDatasetInfoTooltip />:</Label>
                                        </td>
                                        <td id='propR23'>
                                            <Stack tokens={stackTokens} className='requiredAsterik' horizontal>
                                                <Label className='labelChooseFile' id="labelUploadDataset">
                                                    <span className='spanChooseFile'>Select File</span>
                                                    <input onChange={uploadDatasetChange} type="file" multiple={true} name='upload_dataset' placeholder='Upload Test Dataset' className='btnUploadFile' />
                                                </Label>
                                            </Stack>
                                        </td>
                                        <td id='propR33'>
                                            <span>&nbsp;{datasetName}</span>
                                        </td>
                                    </tr>
                                    <tr hidden={uploadDatasetErrorHidden}>
                                        <td>&nbsp;</td>
                                        <td colSpan={2} className='LabelTextErrorOutput'><span>{uploadDatasetError}&nbsp;</span></td>
                                    </tr>
                                    <tr hidden={registeredDatasetMessageHidden}>
                                        <td>&nbsp;</td>
                                        <td colSpan={2} className='existingRegistrationOutput'><span>{registeredDatasetMessage}&nbsp;</span></td>
                                    </tr>
                                    <tr>
                                        <td>&nbsp;</td>
                                        <td colSpan={2}>
                                            <Stack tokens={stackTokens} horizontal>
                                                <Checkbox disabled={preRegisteredDisabled} id="headerCheckbox" label="Has header" styles={checkboxStyle}
                                                    checked={datasetHeader} onChange={datasetHeaderChange} />
                                            </Stack>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <Label className='registerModelLabelText'>Separator:</Label>
                                        </td>
                                        <td colSpan={2}>
                                            <Dropdown
                                                defaultSelectedKey={separatorSelected?.key && separatorSelected?.key}
                                                componentRef={separatorRef}
                                                id='datasetSeparator'
                                                placeholder="Select an option"
                                                options={optionSeparator}
                                                styles={dropdownSeparatorStyles}
                                                onChange={updateSeparator}
                                                errorMessage={separatorError}
                                                required
                                                disabled={preRegisteredDisabled}
                                            />
                                        </td>
                                    </tr>
                                    <tr hidden={DatasetLabelHidden}>
                                        <td>
                                            <Label className='registerModelLabelText'>Dataset label:</Label>
                                        </td>
                                        <td colSpan={2}>
                                            <Dropdown
                                                defaultSelectedKey={datasetLabelSelected?.key && datasetLabelSelected?.key}
                                                componentRef={datasetLabelRef}
                                                id='datasetLabel'
                                                placeholder="Select an option"
                                                options={featureOptions}
                                                styles={dropdownDatasetStyles}
                                                onChange={updateLabel}
                                                errorMessage={datasetLabelError}
                                                required
                                                disabled={preRegisteredDisabled}
                                            />
                                        </td>
                                    </tr>
                                    <tr hidden={DatasetLabelHidden}>
                                        <td className='RegisterModelErrorOutput' colSpan={3}>
                                            <span>{mlFlowModelError}</span>
                                            <Stack horizontal tokens={stackTokens}>
                                                {waitSpinner ? (<Spinner size={SpinnerSize.medium} label="Registering your model, please wait..." ariaLive="assertive" labelPosition="bottom" />) : (
                                                    <></>
                                                )}
                                            </Stack>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className='modalFluentFooter'>
                            <Stack horizontal tokens={stackTokens}>
                                <PrimaryButton secondaryText="Register your Model" type='submit' text="Register" />
                                <DefaultButton onClick={handleClose} text="Cancel" />
                            </Stack>
                        </div>
                    </form>
                </div>
            </Modal>
        </>
    );
}


