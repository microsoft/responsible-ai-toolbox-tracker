import React from 'react';
import { UUID } from 'angular2-uuid';
import { useState, useEffect } from 'react';
import { Contents } from '@jupyterlab/services';
import { PathExt } from '@jupyterlab/coreutils';
import { Label } from '@fluentui/react/lib/Label';
import { FontIcon } from '@fluentui/react/lib/Icon';
import { UploadUtil } from '../../../core/uploadUtil';
import { useSelector, useDispatch } from 'react-redux';
import { RegisterModel } from '../../../core/mlflowUtils';
import { Checkbox, ICheckboxStyles } from '@fluentui/react';
import { Spinner, SpinnerSize } from '@fluentui/react/lib/Spinner';
import { Modal, IStackTokens, Stack, IModal } from '@fluentui/react';
import { DefaultButton, PrimaryButton } from '@fluentui/react/lib/Button';
import { TextField, ITextFieldStyles } from '@fluentui/react/lib/TextField';
import { LargeDatasetInfoTooltip, RegisterModelInfoTooltip } from '../../menus/tooltips';
import { Dropdown, IDropdown, IDropdownStyles, IDropdownOption } from '@fluentui/react/lib/Dropdown';
import '../../../../style/modals.css';
import { Utils } from '../../../core/utils';
import { IFilter } from "../cohorts/cohortTypes";
import { IDatasetType, IFeatureValuesType } from '../../../core/components';

export const EditModelRegistration = () => {
    const WORKSPACE_DIR = 'workspace';
    const ARTIFACTS_DIR = 'artifacts';
    const CATEGORICAL_LABELS_ERRORS = "Categorical labels are not supported.  Please convert your labels to numeric, and try again.";
    /**
     * App state.
    */
    const titleId = 'modelRegistrationModal';
    const dispatch = useDispatch();
    const state = useSelector((state) => state);
    const mlPlatforms = state['mlPlatforms'];
    const showEditModal = state['editModelRegistrationModalState'];
    const projectSettings = state['projectSettings'];
    const projectName = projectSettings['name'];
    let datasets = projectSettings['datasets'];
    let notebooks = projectSettings['notebooks'];
    let selectedModels = projectSettings['selectedModels'];
    let selectedCohorts = projectSettings['selectedCohorts'];
    const problemType = projectSettings['problemType'];
    const datasetLabelRef = React.createRef<IDropdown>();
    const stackTokens: IStackTokens = { childrenGap: 15 };
    const ModalRef = React.createRef<IModal>();
    const mlPlatformRef = React.createRef<IDropdown>();
    const separatorRef = React.createRef<IDropdown>();
    let [isDatasetHeader, setIsDatasetHeader] = React.useState(false)
    let [uploadModelErrorHidden, setUploadModelErrorHidden] = useState(true);
    let [registerModelValidated, setRegisterModelValidated] = useState(false);
    let [uploadDatasetValidated, setUploadDatasetValidated] = useState(false);
    let [uploadDatasetErrorHidden, setUploadDatasetErrorHidden] = useState(true);
    let [mlPlatformSelected, setMlPlatformSelected] = useState<IDropdownOption>();
    let [datasetLabelSelected, setDatasetLabelSelected] = useState<IDropdownOption>();
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
    optionSeparator.push({ key: 'comma', text: 'Comma delimited' });
    optionSeparator.push({ key: 'tab', text: 'Tab delimited' });
    const [separatorError, setSeparatorError] = useState('');
    let [separatorSelected, setSeparatorSelected] = useState<IDropdownOption>();
    const updateSeparator = (event, option, index) => {
        setSeparatorSelected(option);
        setSeparatorError('');
    }
    let strId = state['inEditNotebookId'];
    const inEditId = strId?.slice(strId?.lastIndexOf('_') + 1);
    const notebook = projectSettings["notebooks"][inEditId];
    let [modelName, setModelNameValue] = useState('');
    let [datasetName, setDatasetNameValue] = useState('');
    useEffect(() => {
        let isMounted = true;
        if (isMounted) {
            if (notebook) {
                localStorage.setItem("_registeredModel", notebook['registeredModel']);
                localStorage.setItem("_registeredDataset", notebook["testDataset"]);
                localStorage.setItem("_inEditPlatform", notebook['mlPlatform']);
                localStorage.setItem("_notebookName", notebook['name']);
                localStorage.setItem("_mlFlowRunId", notebook['mlFlowRunId']);
                localStorage.setItem("registeredModel", notebook['registeredModel']);
                localStorage.setItem("registeredDataset", notebook["testDataset"]);
                localStorage.setItem("inEditPlatform", notebook['mlPlatform']);
                localStorage.setItem("notebookName", notebook['name']);
                localStorage.setItem("mlFlowRunId", notebook['mlFlowRunId']);
                setModelNameValue(localStorage.getItem('registeredModel'));
                setDatasetNameValue(localStorage.getItem('registeredDataset'));
                setMlPlatformSelected({ key: localStorage.getItem('inEditPlatform'), text: localStorage.getItem('inEditPlatform') });
                setUploadDatasetValidated(true);
                setRegisterModelValidated(true);
            }
        }
        return () => {
            isMounted = false;
        }
    }, [notebook]);
    /**
     * Edit registration default values.
    */
    const updateEditDatasetFields = (): void => {
        let editDb = false;
        if (datasets?.length !== 0) {
            let ent = {} as IDatasetType;
            for (let db of datasets) {
                if (db && db?.name?.toLowerCase() === localStorage?.getItem('registeredDataset')?.toLowerCase()) {
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
                setIsDatasetHeader(ent.header);
                setFeatureOptions(fOptions);
                setDatasetLabelSelected({ key: ent?.labelIndex?.toString(), text: ent?.label });
                if (ent.separator === 'comma') {
                    setSeparatorSelected({ key: 'comma', text: 'Comma delimited' });
                } else {
                    setSeparatorSelected({ key: 'tab', text: 'Tab delimited' });
                }
                setMlPlatformSelected({ key: localStorage.getItem('inEditPlatform'), text: localStorage.getItem('inEditPlatform') });
                setDatasetEntity(ent);
            }
        }
    }
    useEffect(() => {
        let isMounted = true;
        if (isMounted) {
            updateEditDatasetFields();
        };
        return () => {
            isMounted = false;
        }
    }, [localStorage.getItem('registeredDataset')]);
    /**
     * Dataset label update.
     * @param event 
     * @param option 
     * @param index 
    */
    const updateLabel = (event, option, index) => {
        if (!verifyLabelData(index)) {
            setDatasetLabelError(CATEGORICAL_LABELS_ERRORS);
        }
        else {
            dispatch({ type: 'SELECTED_DATASET_LABEL', payload: option });
            setDatasetLabelSelected(option);
            datasetEntity.labelIndex = index;
            datasetEntity.label = option.text;
            setDatasetEntity(datasetEntity);
            setDatasetLabelError('');
        }
    }
    /**
     * Validation events and error messages
    */
    const [mlPlatformError, setMlPlatformError] = useState('');
    const [mlFlowModelError, setMlFlowModelError] = useState('');
    const [datasetLabelError, setDatasetLabelError] = useState('');
    const [registerModelError, setRegisterModelError] = useState('Selecting your trained model is a requirement');
    const [uploadDatasetError, setUploadDatasetError] = useState('Selecting your project test dataset is a requirement');

    let [waitSpinner, setWaitSpinner] = useState(false);
    /**
     * the model name being uploaded
    */
    const uploadFileChange = (event: any) => {
        let files = event.target.files;
        if (files.length !== 0) {
            localStorage.setItem('registeredModel', files[0].name);
            setModelNameValue(files[0].name);
            setRegisterModelValidated(true);
            setUploadModelErrorHidden(true)
            setRegisterModelError('');
            setMlFlowModelError('');
        }
    }
    /**
     *
     * @param files
     * @returns
    */
    const updateDatasetFields = (files: any): void => {
        const _files = Array.prototype.slice.call(files) as File[];
        if (_files.length !== 0) {
            const dataset = _files[0];
            let datasetEntity = {} as IDatasetType;
            let fValuesList: IFeatureValuesType[] = [];


            let _fValues = {} as IFeatureValuesType;
            let fileReader = new FileReader();
            let recordsCount = 0;

            fileReader.onload = (e) => {
                let separator = ',';
                let lineBreak = '\n';
                let fields = (fileReader.result as string).replace('\r', '').split(lineBreak).shift().split(separator);
                let rawValues = (fileReader.result as string).split(lineBreak).map(s => s.replace('\r', '').split(separator)).slice(1).filter(value => value.length >= fields.length);

                recordsCount = rawValues.length;

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
            fileReader.readAsText(dataset);
        }
    }

    const validateDataset = (dbName: string): boolean => {
        let editDb = false;
        if (datasets?.length !== 0) {
            let ent = {} as IDatasetType;
            for (let db of datasets) {
                if (db && db.name.toLowerCase() === dbName.toLowerCase()) {
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
                setIsDatasetHeader(ent.header);
                setDatasetLabelSelected({ key: ent?.labelIndex.toString(), text: ent?.label });
                if (ent.separator === 'comma') {
                    setSeparatorSelected({ key: 'comma', text: 'Comma delimited' });
                } else {
                    setSeparatorSelected({ key: 'tab', text: 'Tab delimited' });
                }
                return true;
            } else {
                setIsDatasetHeader(false);
                setDatasetLabelSelected(undefined);
                setSeparatorSelected(undefined);
                return false;
            }
        } else {
            return undefined;
        }
    }
    /**
     * Identify the dataset settings
    */
    const uploadDatasetChange = (event): void => {
        let files = event.target.files;
        if (files.length !== 0) {
            if (validateDataset(files[0].name)) {
                localStorage.setItem('registeredDataset', files[0].name);
                setDatasetNameValue(files[0].name);
                setUploadDatasetValidated(true);
                setUploadDatasetErrorHidden(true);
                setUploadDatasetError('');
                updateDatasetFields(files);
            }
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
     * 
     * @param labelIndex 
     * @returns 
    */
    const verifyLabelData = (labelIndex: number) => {
        if (datasetEntity && datasetEntity?.features.length > 1) {
            let labels = datasetEntity.featuresValues[labelIndex];
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
        } else {
            /**
             * Account for hte edit registration.
            */
            if (notebook) {
                return true;
            }
        }
        return false;
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
    const saveRegisteredModelSettings = async (notebookName: string, registeredModel: string, dataset: string, metricsList: any, mlPlatformSelected: string, addDataset: boolean, datasetHeader: boolean, separator: string): Promise<Contents.IModel> => {
        const _utils = new Utils();
        return _utils.SaveRegisteredModelSettings(projectSettings, notebookName, registeredModel, dataset, metricsList, mlPlatformSelected, datasetEntity, addDataset, selectedModels, datasetHeader, separator)
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
     * @param registeredModel 
     * @param testDataName 
     * @param testDataTarget 
     * @param mlPlatformSelected 
     * @param header 
     * @param separator 
     * @returns 
    */
    const verifyRegistration = async (registeredModel: string, testDataName: string, testDataTarget: string, mlPlatformSelected: string, header: boolean, separator: string) => {
        const artifactsDir = 'artifacts';
        const workspace = 'workspace';
        let addDataset = true;
        const modelPath = PathExt.join(workspace, projectName, artifactsDir, registeredModel).normalize();
        const datasetPath = PathExt.join(workspace, projectName, artifactsDir, testDataName).normalize();

        let _metricsList = await RegisterModel(projectSettings, localStorage.getItem('mlFlowRunId'), modelPath, datasetPath, testDataTarget, mlPlatformSelected,
            header, separator, problemType, localStorage.getItem('notebookName'), undefined, undefined, undefined);
        let metricsList = await _metricsList;
        if (Object.keys(metricsList).length !== 0) {
            setWaitSpinner(false);
            /**
             * Update the cohort file.
             */
            let dateTime = new Date();
            datasetEntity.name = localStorage.getItem('registeredDataset');
            datasetEntity.isCohort = false;
            let filterList: IFilter[] = [];
            datasetEntity.filterValuesList = filterList;
            datasetEntity.dateCreated = dateTime.toLocaleDateString();
            datasetEntity.lastUpdated = dateTime.toLocaleDateString()
            datasetEntity.registeredModel = registeredModel;
            datasetEntity.mlPlatform = mlPlatformSelected;
            datasetEntity.mlFlowRunId = localStorage.getItem('mlFlowRunId');
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
            saveRegisteredModelSettings(localStorage.getItem('notebookName'), localStorage.getItem('registeredModel'), localStorage.getItem('registeredDataset'),
                metricsList, mlPlatformSelected, addDataset, header, separator).then(content => {
                    if (content) {
                        dispatch({ type: 'SELECTED_MODELS_VISUAL', payload: projectSettings['selectedModels'] });
                        dispatch({ type: 'SELECTED_METRICS_VISUAL', payload: projectSettings['selectedMetrics'] });
                        dispatch({ type: 'SELECTED_COHORTS_VISUAL', payload: projectSettings['selectedModels'] });
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
    const checkboxStyle: Partial<ICheckboxStyles> = { root: { marginBottom: 5, marginTop: 10 } };
    const datasetHeaderChange = React.useCallback((ev?: React.FormEvent<HTMLElement | HTMLInputElement>, checked?: boolean): void => {
        setIsDatasetHeader(!!checked);
        if (checked) {
        }
        else {
        }
    },
        [],);
    /**
      * handle the form submit event
    */
    const handleSubmit = async (event) => {
        setMlFlowModelError('');
        const current_event = event.currentTarget;
        if (!registerModelValidated
            || !uploadDatasetValidated
            || !datasetLabelSelected || datasetLabelSelected?.text?.length === 0
            || !mlPlatformSelected || mlPlatformSelected?.text?.length === 0
            || !separatorSelected || separatorSelected?.text?.length === 0) {
            if (current_event.upload_model.value === '' && !localStorage.getItem('registeredModel')) {
                setRegisterModelError('Selecting your trained model is a requirement');
                setUploadModelErrorHidden(false);
            }
            else {
                setUploadModelErrorHidden(true);
                setRegisterModelError('');
            }
            if (current_event.upload_dataset.value === '' && !localStorage.getItem('registeredDataset')) {
                setUploadDatasetError('Selecting your project test dataset is a requirement');
                setUploadDatasetErrorHidden(false);
            }
            else {
                setUploadDatasetErrorHidden(true);
                setUploadDatasetError('');
            }
            if (datasetLabelRef.current.selectedOptions.length === 0) {
                setDatasetLabelError('Selecting the test dataset label is a requirement');
            }
            else {
                setDatasetLabelError('');
            }
            if (mlPlatformRef.current.selectedOptions.length === 0) {
                setMlPlatformError('Selecting the platform is a requirement');
            }
            else {
                setMlPlatformError('');
            }

            if (separatorRef.current.selectedOptions.length === 0) {
                setSeparatorError('Selecting the dataset separator is a requirement');
            }
            else {
                setSeparatorError('');
            }
        }
        else {
            const sep = separatorSelected.key.toString();
            const header = current_event.headerCheckbox.checked;
            /**
             * Model file
            */
            const modelFiles = Array.prototype.slice.call(current_event.upload_model.files) as File[];
            /**
             * Dataset file
            */
            const datasetFiles = Array.prototype.slice.call(current_event.upload_dataset.files) as File[];

            if (notebook) {
                setWaitSpinner(true);
                if (modelFiles && modelFiles.length > 0) {
                    const pendingModel = modelFiles.map(model => _onInputModelChanged(model));
                    void Promise.all(pendingModel).then(content => {
                        if (content) {
                            console.warn('Model uploaded successfully');
                            if (datasetFiles && datasetFiles.length > 0) {
                                const dbFile = datasetFiles[0];
                                _onInputDatasetChanged(dbFile).then(content => {
                                    if (content) {
                                        console.warn('Test dataset uploaded successfully');

                                        verifyRegistration(localStorage.getItem('registeredModel'), localStorage.getItem('registeredDataset'), datasetLabelSelected.text, mlPlatformSelected.text, header, sep).then(res => {
                                            if (res) {
                                                console.warn('Model Registration Success');
                                                setWaitSpinner(false);
                                            } else {
                                                setWaitSpinner(false);
                                                setMlFlowModelError('Model Registration failed');
                                                stateOnRegFailureOrOnClose();
                                            }
                                        }).catch((error: Error) => {
                                            console.log(error.message);
                                            setWaitSpinner(false);
                                            setMlFlowModelError('Model Registration failed');
                                            stateOnRegFailureOrOnClose();
                                        });
                                    }
                                });
                            } else {
                                verifyRegistration(localStorage.getItem('registeredModel'), localStorage.getItem('registeredDataset'), datasetLabelSelected.text, mlPlatformSelected.text, header, sep).then(res => {
                                    if (res) {
                                        console.warn('Model Registration Success');
                                        setWaitSpinner(false);
                                    } else {
                                        setWaitSpinner(false);
                                        setMlFlowModelError('Model Registration failed');
                                        stateOnRegFailureOrOnClose();
                                    }
                                }).catch((error: Error) => {
                                    console.log(error.message);
                                    setWaitSpinner(false);
                                    setMlFlowModelError('Model Registration failed');
                                    stateOnRegFailureOrOnClose();
                                });
                            }

                        }
                    }).catch(error => {
                        console.warn('Upload Error : ' + error);
                    });
                } else if (datasetFiles && datasetFiles.length > 0) {
                    const dbFile = datasetFiles[0];
                    _onInputDatasetChanged(dbFile).then(content => {
                        if (content) {
                            console.warn('Test dataset uploaded successfully');
                            verifyRegistration(localStorage.getItem('registeredModel'), localStorage.getItem('registeredDataset'), datasetLabelSelected.text, mlPlatformSelected.text, header, sep).then(res => {
                                if (res) {
                                    console.warn('Model Registration Success');
                                    setWaitSpinner(false);
                                } else {
                                    setWaitSpinner(false);
                                    setMlFlowModelError('Model Registration failed');
                                    stateOnRegFailureOrOnClose();
                                }
                            }).catch((error: Error) => {
                                console.log(error.message);
                                setWaitSpinner(false);
                                setMlFlowModelError('Model Registration failed');
                                stateOnRegFailureOrOnClose();
                            });
                        }
                    });
                } else {
                    verifyRegistration(localStorage.getItem('registeredModel'), localStorage.getItem('registeredDataset'), datasetLabelSelected.text, mlPlatformSelected.text, header, sep).then(res => {
                        if (res) {
                            console.warn('Model Registration Success');
                            setWaitSpinner(false);
                        } else {
                            setWaitSpinner(false);
                            setMlFlowModelError('Model Registration failed');
                            stateOnRegFailureOrOnClose();
                        }
                    }).catch((error: Error) => {
                        console.log(error.message);
                        setWaitSpinner(false);
                        setMlFlowModelError('Model Registration failed');
                        stateOnRegFailureOrOnClose();
                    });
                }

            } else {
                console.log("Error referencing the notebook.")
                stateOnRegFailureOrOnClose();
            }
        }

        event.preventDefault();
        event.stopPropagation();
    };
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
    const regModelName: Partial<ITextFieldStyles> = {
        fieldGroup: { width: 140, height: 32, alignContent: 'center', textAlign: 'center' }
    }
    
    const stateOnRegFailureOrOnClose = () => {
        localStorage.setItem("registeredModel", localStorage.getItem('_registeredModel'));
        localStorage.setItem("registeredDataset", localStorage.getItem('_registeredDataset'));
        localStorage.setItem("inEditPlatform", localStorage.getItem('_inEditPlatform'));
        localStorage.setItem("notebookName", localStorage.getItem('_notebookName'));
        localStorage.setItem("mlFlowRunId", localStorage.getItem('_mlFlowRunId'));
        setModelNameValue(localStorage.getItem('registeredModel'));
        setDatasetNameValue(localStorage.getItem('registeredDataset'));
        setMlPlatformSelected({ key: localStorage.getItem('inEditPlatform'), text: localStorage.getItem('inEditPlatform') });
        setUploadDatasetValidated(true);
        setRegisterModelValidated(true);

        notebook['registeredModel'] = localStorage.getItem('_registeredModel');
        notebook["testDataset"] = localStorage.getItem('_registeredDataset');
        notebook['mlPlatform'] = localStorage.getItem('_inEditPlatform');
        notebook['name'] = localStorage.getItem('_notebookName');
        notebook['mlFlowRunId'] = localStorage.getItem('_mlFlowRunId');
    }
    const handleClose = () => {
        dispatch({ type: 'EDIT_MODEL_REGISTRATION_MODAL_STATE', payload: false });
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
        const notebookName = localStorage.getItem('notebookName');
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
    return (
        <>
            <Modal
                titleAriaId={titleId}
                isOpen={showEditModal}
                onDismiss={handleClose}
                componentRef={ModalRef}
            >
                <div className='modalRegisterModel'>
                    <form onSubmit={handleSubmit} id='frmEditRegisterModel' noValidate >
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
                                                styles={regModelName}
                                                placeholder='Select File'
                                                disabled
                                            />
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
                                                defaultSelectedKey={mlPlatformSelected?.text ? mlPlatformSelected?.key : undefined}
                                                componentRef={mlPlatformRef}
                                                id='MlPlatform'
                                                placeholder="Select an option"
                                                options={optionMlPlatforms}
                                                styles={dropdownStyles}
                                                onChange={updateMlPlatform}
                                                errorMessage={mlPlatformError}
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
                                                styles={regModelName}
                                                placeholder='Select File '
                                                disabled
                                            />
                                        </td>
                                        <td id='propR33'>
                                            <span>&nbsp;{datasetName}</span>
                                        </td>
                                    </tr>
                                    <tr hidden={uploadDatasetErrorHidden}>
                                        <td>&nbsp;</td>
                                        <td className='LabelTextErrorOutput' colSpan={2}><span>{uploadDatasetError}&nbsp;</span></td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <Label className='registerModelLabelText'>Dataset label:</Label>
                                        </td>
                                        <td colSpan={2}>
                                            <Dropdown
                                                defaultSelectedKey={datasetLabelSelected?.text ? datasetLabelSelected?.key : undefined}
                                                componentRef={datasetLabelRef}
                                                id='datasetLabel'
                                                placeholder="Select an option"
                                                options={featureOptions}
                                                styles={dropdownDatasetStyles}
                                                onChange={updateLabel}
                                                errorMessage={datasetLabelError}
                                                required
                                                disabled

                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>&nbsp;</td>
                                        <td colSpan={2}>
                                            <Stack tokens={stackTokens} horizontal>
                                                <Checkbox disabled id="headerCheckbox" label="Has header" styles={checkboxStyle} checked={isDatasetHeader} onChange={datasetHeaderChange} />
                                            </Stack>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <Label className='registerModelLabelText'>Separator:</Label>
                                        </td>
                                        <td colSpan={2}>
                                            <Dropdown
                                                defaultSelectedKey={separatorSelected?.text ? separatorSelected?.key : undefined}
                                                componentRef={separatorRef}
                                                id='datasetSeparator'
                                                placeholder="Select an option"
                                                options={optionSeparator}
                                                styles={dropdownSeparatorStyles}
                                                onChange={updateSeparator}
                                                errorMessage={separatorError}
                                                required
                                                disabled
                                            />
                                        </td>
                                    </tr>
                                    <tr>
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


