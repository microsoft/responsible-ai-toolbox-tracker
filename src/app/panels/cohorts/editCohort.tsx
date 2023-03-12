// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { UUID } from 'angular2-uuid';
import React, { useState } from 'react';
import { PathExt } from '@jupyterlab/coreutils';
import { FontIcon } from '@fluentui/react/lib/Icon';
import { useSelector, useDispatch } from 'react-redux';
import { FilterOperations, IFilter } from "./cohortTypes";
import { Spinner, SpinnerSize } from '@fluentui/react/lib/Spinner';
import { TextField, ITextFieldStyles } from '@fluentui/react/lib/TextField';
import { ChoiceGroup, IChoiceGroupOption } from '@fluentui/react/lib/ChoiceGroup';
import { DefaultButton, PrimaryButton, ActionButton } from '@fluentui/react/lib/Button';
import {
    Dropdown,
    IDropdown,
    IDropdownStyles,
    IDropdownOption
} from '@fluentui/react/lib/Dropdown';
import {
    Checkbox, ICheckboxStyles,
    IIconProps, Stack,
    IStackStyles, ITextField,
} from '@fluentui/react';
import {
    getRandomNumber,
    getFilterOutput,
    applyFilters,
    buildDataMatrix,
    updateCohortsList,
    notNumeric,
    duplicateName
} from './cohortUtils';
import { Utils } from '../../../core/utils';
import { IDatasetType } from '../../../core/components';
import { RegisterModel } from '../../../core/mlflowUtils';

export const EditCohort: React.FunctionComponent = () => {
    const FILTER_ERROR = "Duplicate filters are not allowed.";
    const COHORT_NAME_INVALID = 'Name length should be between 1 and 100 characters, and not include “/“, “\”, "<", ">", "?", or “:”';
    const RECORDS_COUNT_ERROR = "The cohort you're trying to create has less the minimum required records count of 5..  Your filters could be too restrictive.  Your filters have been reset. Try again!";

    const WORKSPACE_DIR = 'workspace';
    const ARTIFACTS_DIR = 'artifacts';
    const COHORTS_DIR = "cohorts";
    /**
     * retrieve the app state.
    */
    const dispatch = useDispatch();
    const state = useSelector((state) => state);
    let inEditCohort = state['inEditCohort'];
    let projectSettings = state['projectSettings'];
    const projectName = projectSettings['name'];
    let cohortsList = projectSettings['cohortsList'];
    const problemType = projectSettings['problemType'];
    /**
     * In edit cohort values.
    */
    let [waitSpinner, setWaitSpinner] = useState(false);
    const [defaultCohortName, setDefaultCohortName] = useState('');
    const [defaultSelectedDatasetKey, setDefaultSelectedDatasetKey] = useState('');
    /**
     * New cohort state settings.
    */
    const [filterHidden, setFilterHidden] = useState(false);
    const [operationHidden, setOperationHidden] = useState(false);
    const [cohortOptionsHidden, setCohortOptionsHidden] = useState(true);
    const [operationValueHidden, setOperationValueHidden] = useState(true);
    const [btnSaveCohortDisabled, setBtnSaveCohortDisabled] = useState(true);
    const [isCategoricalDisabled, setIsCategoricalDisabled] = useState(true);
    const [operationMaxMinHidden, setOperationMaxMinHidden] = useState(true);
    /**
     * Cohort entries validation.
    */
    const [cohortNameError, setCohortNameError] = useState('');
    const [operationMaxError, setOperationMaxError] = useState('');
    const [operationMinError, setOperationMinError] = useState('');
    const [operationValueError, setOperationValueError] = useState('');
    const [selectedOperationError, setSelectedOperationError] = useState('');
    const [operationMinValidated, setOperationMinValidated] = useState(false);
    const [operationMaxValidated, setOperationMaxValidated] = useState(false);
    const [recordsCountErrorHidden, setRecordsCountErrorHidden] = useState(true);
    const [cohortRegistrationFailed, setCohortRegistrationFailed] = useState('');
    const [cohortRegistrationFailedHidden, setCohortRegistrationFailedHidden] = useState(true);
    const [operationValueValidated, setOperationValueValidated] = useState(false);
    const [selectedDatasetOptionError, setSelectedDatasetOptionError] = useState('');
    const [selectedDatasetFilterError, setSelectedDatasetFilterError] = useState('');
    const [selectedDatasetOptionValidated, setSelectedDatasetOptionValidated] = useState(false);
    const [validateFilterHidden, setValidateFilterHidden] = useState(true);
    const [filterValuesList, setFilterValuesList] = React.useState<IFilter[]>([]);
    const operationRef = React.createRef<IDropdown>();
    const [selectedOperation, setSelectedOperation] = useState<IDropdownOption>();
    const [isCategoricalChecked, setIsCategoricalChecked] = React.useState(false)
    const datasetFilterRef = React.createRef<IDropdown>();
    const [fieldValueOptions, setFieldValueOptions] = useState<IDropdownOption[]>();
    const [selectedDatasetFilter, setSelectedDatasetFilter] = useState<IChoiceGroupOption>()
    const [filterOptions, setFilterOptions] = useState<IDropdownOption[]>();
    let [dataMatrix, setDataMatrix] = useState<any[][]>();
    const [selectedDataset, setSelectedDataset] = useState<any>();
    const [selectedDatasetOption, SetSelectedDatasetOption] = useState<IChoiceGroupOption>();
    const [cohortName, setCohortName] = useState('');
    const cohortNameRef = React.createRef<ITextField>();
    /**
     * Fluent built-in style options.
    */
    const cohortNameStyle: Partial<ITextFieldStyles> = {
        root: { paddingBottom: 10 },
        fieldGroup: { width: 300, height: 32, alignContent: 'left', textAlign: 'left' }
    };
    const dropdownStyle: Partial<IDropdownStyles> = {
        root: { paddingTop: 10 },
        dropdown: { width: 280, height: 32 },
        dropdownOptionText: { overflow: 'visible', whiteSpace: 'normal' },
        dropdownItem: { height: 'auto' },
    };
    const addFilerStyles = { root: { marginTop: 20 } };
    const checkboxStyle: Partial<ICheckboxStyles> = { root: { marginBottom: 5, marginTop: 10 } };
    const stackStyles: IStackStyles = {
        root: {
            width: 280,
            childrenGap: 10,
            borderTop: '1px solid #ccc'
        }
    };
    const buttonStyles = { root: { marginRight: 8 } };
    const clearIcon: IIconProps = { iconName: 'clear' };

    /**
      * Build the operation options.
    */
    const operationOptions: IDropdownOption[] = [];
    const buildOperationOptions = () => {
        let filterOpt = {} as IDropdownOption;
        for (let op in FilterOperations) {
            filterOpt.key = op;
            filterOpt.ariaLabel = FilterOperations[op];
            filterOpt.text = FilterOperations[op];
            operationOptions.push(filterOpt);
            filterOpt = {} as IDropdownOption;
        }
    }
    buildOperationOptions();
    /**
     * Capture the cohort name.
    */
    const onCohortNameChange = event => {
        if (event.target.value !== '') {
            setCohortName(event.target.value);
            setBtnSaveCohortDisabled(false);
            setCohortNameError('');
        }
    }
    /**
     * Get Cohort data.
    */
    const getCohortData = async (cohortKey: string) => {
        let _utils = new Utils();
        return _utils.GetCohortData(projectSettings.name, cohortKey).then(response => {
            return response;
        }).catch((error: Error) => {
            return undefined;
        });
    }
    /**
     * Select the dataset to build the cohort.
    */
    const onDatasetChoiceChange = React.useCallback((ev: React.SyntheticEvent<HTMLElement>, option: IChoiceGroupOption) => {
        SetSelectedDatasetOption(option);
        /**
         * Get the selected dataset values.
        */
        getCohortData(option.key).then(content => {
            if (content) {
                setSelectedDataset(content);
                /**
                 * Build a data matrix out of the features values.
                */
                setDataMatrix(buildDataMatrix(content, true))
                /**
                 * Set the available filter options.
                */
                updateFilters(content);
            }
        });

        setFilterHidden(false);
        setCohortOptionsHidden(false);
        setSelectedDatasetOptionValidated(true);
        setSelectedDatasetOptionError('');
    }, []);
    /**
     * Construct the dataset column options.
    */
    const updateFilters = (selectedDataset: any): void => {
        let features = selectedDataset.features;
        let tmp: IDropdownOption[] = [];
        for (let i = 0; i < features!.length; i++) {
            tmp.push({ key: features[i], text: features[i] });
        }
        setFilterOptions(tmp);
    }
    /**
     * Identify the dataset filter.
    */
    const selectFilter = async (event, option, index) => {
        dispatch({ type: 'SELECTED_DATASET_FILTER', payload: option });
        setSelectedDatasetFilter(option);
        setIsCategoricalDisabled(false);
        setSelectedCategoricalKeys([]);
        setSelectedCategoricalValues([]);
        setSelectedDatasetFilterError('');
        for (let key of Object.keys(selectedDataset.featuresValues)) {
            
            // let fValues = selectedDataset.featuresValues[key];
            
            // notebook.metrics.forEach(obj => notebookMetricsArr.push(Object.assign({}, obj)));
            let fValues = JSON.parse(JSON.stringify( selectedDataset.featuresValues[key]));
            if (option.text === fValues.name) {
                let tmpList: IDropdownOption[] = [];
                /**
                 * Sort and convert to a IDropdownOption array.
                 */
                fValues.values.sort();

                fValues.values.map((v => {
                    tmpList.push({ key: getRandomNumber(0, Number.MAX_SAFE_INTEGER), text: v });
                }));
                /**
                * Remove null, empty or duplicate entries.
                */
                const dValues = tmpList.filter((ent, i, arr) => arr.findIndex(t => t.text === ent.text && t.text !== '' && t.text !== null) === i);
                setFieldValueOptions(dValues);
            }
        }
    }
    /**
     * Identify filter selection as categorical.
    */
    const onIsCategoricalChange = React.useCallback(
        (ev?: React.FormEvent<HTMLElement | HTMLInputElement>, checked?: boolean): void => {
            setIsCategoricalChecked(!!checked);
            if (checked) {
                setFilterHidden(false);
                setOperationMaxMinHidden(true);
                setOperationValueHidden(true);
                setOperationHidden(true);
                setCategoricalFieldHidden(false);
            }
            else {
                setOperationHidden(false);
                setFilterHidden(false);
                setCategoricalFieldHidden(true);
                if (document.getElementById('operation-option').textContent === FilterOperations.InTheRangeOf) {
                    setOperationValueHidden(true);
                    setOperationMaxMinHidden(false);
                }
                else {
                    setOperationMaxMinHidden(true);
                    setOperationValueHidden(false)
                }
            }
        },
        [],
    );
    /**
     * Select the operation to use for building the cohort.
    */
    const selectOperation = (event, option, index): void => {
        setSelectedOperation(option);
        dispatch({ type: 'SELECTED_DATASET_OPERATION', payload: option });
        setSelectedOperationError('');
        if (option.text === FilterOperations.InTheRangeOf) {
            setOperationValueHidden(true);
            setOperationMaxMinHidden(false);
        }
        else {
            setOperationMaxMinHidden(true);
            setOperationValueHidden(false)
        }
    }
    /**
     * Update the operation value.
    */
    const operationValueRef = React.createRef<IDropdown>();
    const [operationValue, setOperationValue] = useState<IDropdownOption>();
    const updateOperationValue = (event, option, index): void => {
        setOperationValue(option);
        setOperationValueError('');
        setOperationValueValidated(true);
    }
    /**
     * Update the operation min value.
    */
    const operationMinRef = React.createRef<IDropdown>();
    const [operationMin, setOperationMin] = useState<IDropdownOption>();
    const updateOperationMin = (event, option, index): void => {
        setOperationMin(option);
        setOperationMinError('');
        setOperationMinValidated(true);
    }
    /**
     * update teh operation max value.
    */
    const operationMaxRef = React.createRef<IDropdown>();
    const [operationMax, setOperationMax] = useState<IDropdownOption>();
    const updateOperationMax = (event, option, index): void => {
        setOperationMax(option);
        setOperationMaxError('');
        setOperationMaxValidated(true);
    }
    /**
     * Update the selected values for the categorical filters.
    */
    const categoricalFieldRef = React.createRef<IDropdown>();
    const [categoricalFieldHidden, setCategoricalFieldHidden] = useState(true);
    const [categoricalFieldError, setCategoricalFieldError] = useState('');
    const [selectedCategoricalKeys, setSelectedCategoricalKeys] = React.useState<string[]>([]);
    const [selectedCategoricalValues, setSelectedCategoricalValues] = React.useState<string[]>([]);
    const updateCategoricalField = (event: React.FormEvent<HTMLDivElement>, item: IDropdownOption): void => {
        if (item) {
            setSelectedCategoricalKeys(
                item.selected ? [...selectedCategoricalKeys, item.key as string] : selectedCategoricalKeys.filter(key => key !== item.key),
            );

            setSelectedCategoricalValues(
                item.selected ? [...selectedCategoricalValues, item.text as string] : selectedCategoricalValues.filter(text => text !== item.text),
            );
            setSelectedOperation(undefined);
            setCategoricalFieldError('');
        }
    };
    /**
     * 
     * @param newFilter 
     * @param filterValuesList 
     * @returns 
    */
    const validateFilter = (newFilter: IFilter, filterValuesList: IFilter[]): boolean => {
        if (!filterValuesList || filterValuesList.length === 0) { return true; }
        for (let filter of filterValuesList) {
            if (filter.output === newFilter.output) {
                return false;
            }
        }
        return true;
    }
    /**
     * build the cohort filter.
    */
    const addFilter = (event): void => {
        setValidateFilterHidden(true);
        setRecordsCountErrorHidden(true);
        let _filterValuesList: IFilter[] = [];
        filterValuesList.forEach(obj => _filterValuesList.push(Object.assign({}, obj)));
        let cohortFilter = {} as IFilter;
        cohortFilter.args = [];
        cohortFilter.dataset = selectedDatasetOption?.text;
        cohortFilter.column = selectedDatasetFilter?.text;
        cohortFilter.key = UUID.UUID();

        if (isCategoricalChecked) {
            cohortFilter.isCategorical = true;
            cohortFilter.operation = undefined;
            /**
             * Convert string array to number array, and add it to arg.
            */
            //  
            cohortFilter.args = selectedCategoricalValues.map(function (item) {
                if (notNumeric(item)) {
                    return item;
                } else {
                    return Number(item);
                }
            });

            if (cohortFilter.args && cohortFilter.args.length > 0) {
                cohortFilter.output = getFilterOutput(cohortFilter);
                if (!validateFilter(cohortFilter, _filterValuesList)) {
                    setValidateFilterHidden(false);
                    return;
                } else {
                    setValidateFilterHidden(true);
                }
                _filterValuesList.push(cohortFilter);
                dispatch({ type: 'FILTER_VALUES_LIST', payload: _filterValuesList });
                setBtnSaveCohortDisabled(false);
            }
            else {
                setCategoricalFieldError('Please select a value');
            }

        }
        else {
            cohortFilter.isCategorical = false;
            cohortFilter.operation = FilterOperations[selectedOperation?.key];

            if (selectedOperation?.text === FilterOperations.InTheRangeOf) {
                if (operationMinValidated && operationMaxValidated) {
                    cohortFilter.args.push(Number(operationMin?.text));
                    cohortFilter.args.push(Number(operationMax?.text));
                    cohortFilter.output = getFilterOutput(cohortFilter);
                    if (!validateFilter(cohortFilter, _filterValuesList)) {
                        setValidateFilterHidden(false);
                        return;
                    } else {
                        setValidateFilterHidden(true);
                    }
                    _filterValuesList.push(cohortFilter);

                    dispatch({ type: 'FILTER_VALUES_LIST', payload: _filterValuesList });
                    setOperationMinError('');
                    setOperationMaxError('');
                    setBtnSaveCohortDisabled(false);
                }
                else {
                    if (!operationMinValidated) { setOperationMinError('Please select a minimum.'); }
                    if (!operationMaxValidated) { setOperationMaxError('Please select a maximum.'); }
                }
            }
            else {
                if (operationValueValidated) {
                    cohortFilter.args.push(Number(operationValue?.text));
                    cohortFilter.output = getFilterOutput(cohortFilter);
                    if (!validateFilter(cohortFilter, _filterValuesList)) {
                        setValidateFilterHidden(false);
                        return;
                    } else {
                        setValidateFilterHidden(true);
                    }
                    _filterValuesList.push(cohortFilter);
                    dispatch({ type: 'FILTER_VALUES_LIST', payload: _filterValuesList });
                    setBtnSaveCohortDisabled(false);
                }
                else {
                    setOperationValueError('Please select a value.');
                }
            }
        }
        setFilterValuesList(_filterValuesList);
    };
    /**
     * Clear all filters.
    */
    const clearAllFilters = (): void => {
        setFilterValuesList([]);
        setBtnSaveCohortDisabled(true);
        setValidateFilterHidden(true);
        setRecordsCountErrorHidden(true);
        setCohortRegistrationFailedHidden(true);
        setCohortRegistrationFailed('');
        dispatch({ type: 'FILTER_VALUES_LIST', payload: [] });
    }
    /**
     * Clear one filter.
    */
    const clearFilter = (event): void => {
        filterValuesList.map((v => {
            if (event.currentTarget.id === v.key) {
                const index = filterValuesList.indexOf(v);
                if (index !== -1) {
                    filterValuesList.splice(index, 1);
                }
            }
        }));

        if (filterValuesList?.length === 0) {
            setBtnSaveCohortDisabled(true);
        }
        setValidateFilterHidden(true);
        setRecordsCountErrorHidden(true);
        setFilterValuesList(filterValuesList);
        if (filterValuesList?.length > 0) {
            setBtnSaveCohortDisabled(false);
        } else {
            setBtnSaveCohortDisabled(true);
        }
        setCohortRegistrationFailedHidden(true);
        setCohortRegistrationFailed('');
        dispatch({ type: 'FILTER_VALUES_LIST', payload: filterValuesList });
    }
    /**
     * Update the project settings 
     * @param transformedCohort 
     * @param metrics 
    */
    const _updateProjectSettings = async (transformedCohort: IDatasetType, metrics: any, _utils: Utils) => {
        let db = {} as IDatasetType;
        db.key = transformedCohort.key;
        db.name = transformedCohort.name;
        db.isCohort = transformedCohort.isCohort;
        db.masterKey = transformedCohort.masterKey;
        db.masterName = transformedCohort.masterName;
        db.label = transformedCohort.label;
        db.labelIndex = transformedCohort.labelIndex;
        db.features = transformedCohort.features;
        db.filterValuesList = transformedCohort.filterValuesList;
        db.recordsCount = transformedCohort.recordsCount;
        db.registeredModel = transformedCohort.registeredModel;
        db.mlPlatform = transformedCohort.mlPlatform;
        db.mlFlowRunId = transformedCohort.mlFlowRunId;
        db.lastUpdated = transformedCohort.lastUpdated;

        let _datasets = projectSettings['datasets'];
        let addItem = true;
        for (let i = 0; i < _datasets?.length; i++) {
            if (_datasets[i].key === db?.key) {
                _datasets[i] = db;
                addItem = false;
            }
        }
        if (addItem) { _datasets.push(db); }
        updateCohortsList(cohortsList, transformedCohort).then(content => {
            if (content) {
                let selectedCohortsKeys = state['projectSettings']['selectedCohorts'];
                if (!selectedCohortsKeys.includes(transformedCohort.name)) {
                    selectedCohortsKeys.push(transformedCohort.name);
                }
                dispatch({ type: 'UPDATE_COHORT_SETTINGS_LIST', payload: content });
                dispatch({ type: 'SELECTED_COHORTS_VISUAL', payload: selectedCohortsKeys });
                _utils.saveCohortModelSettings(projectSettings, transformedCohort, metrics, _datasets, selectedCohortsKeys)
                    .then(response => {
                        return response;
                    })
                    .catch((error: Error) => {
                        console.log(error.message);
                        return null;
                    });
            }
            else {
                //todo: log the error and inform the client.
            }
        });
    }
    /**
     * 
     * @param transformedCohort 
     * @returns 
    */
    const verifyRegistration = async (transformedCohort: IDatasetType) => {
        const modelPath = PathExt.join(WORKSPACE_DIR, projectName, ARTIFACTS_DIR, transformedCohort.registeredModel).normalize();
        const datasetPath = PathExt.join(WORKSPACE_DIR, projectName, COHORTS_DIR, transformedCohort.key, transformedCohort.key) + '.json';
        return RegisterModel(projectSettings, transformedCohort.mlFlowRunId, modelPath, datasetPath.normalize(), transformedCohort.label,
            transformedCohort.mlPlatform, transformedCohort.header, transformedCohort.separator, problemType, undefined, transformedCohort.name, transformedCohort.masterName, transformedCohort.key)
            .then(res => {
                if (res) {
                    return res;
                }
            })
            .catch((error) => {
                throw error;
            });
    }
    /**
     * roll back the process if the model registration failed.
     * @param cohortKey 
    */
    const rollBackSaveCohort = (cohortKey: string, _utils: Utils) => {
        _utils.deleteCohort(projectName, cohortKey).then(res => {
            //do nothing.
        }).catch((error) => {
            throw error;
        });
    }
    /**
     * 
     * @param cohortKey 
    */
    const rollBackUpdateCohort = (cohortKey: string, _utils: Utils) => {
        _utils.restoreCohort(projectName, cohortKey).then(res => {
        }).catch((error) => {
            throw error;
        });
    }
    /**
     * record count could still generates exceptions even if it is not zero. 
     * It depends on the backend ML algorithm that is processing the request.
     * We opted to stop processing the request if the count is less than 6,
     *  and let the backend throw an error for the other cases.
     * @param count 
     */
    const validateRecordCount = (count: number) => {
        if (!count || count < 6) {
            setWaitSpinner(false);
            clearAllFilters();
            setRecordsCountErrorHidden(false);
            return false;
        } else {
            setRecordsCountErrorHidden(true);
            return true;
        }
    }
    /**
     * Save the cohort.  Raise exception on failure.
    */
    const saveCohort = (_utils: Utils) => {
        let ent = {} as IDatasetType;
        let dateTime = new Date();
        ent.key = UUID.UUID();
        ent.name = cohortName;
        ent.isCohort = true;
        ent.masterKey = selectedDatasetOption?.key;
        ent.masterName = selectedDatasetOption?.text;
        ent.labelIndex = selectedDataset.labelIndex;
        ent.label = selectedDataset.label;
        ent.registeredModel = selectedDataset.registeredModel;
        ent.mlPlatform = selectedDataset.mlPlatform;
        ent.mlFlowRunId = selectedDataset.mlFlowRunId;
        ent.features = selectedDataset.features;
        ent.featuresValues = selectedDataset.featuresValues;
        ent.header = selectedDataset.header;
        ent.separator = selectedDataset.separator;
        ent.filterValuesList = filterValuesList;
        ent.dateCreated = dateTime.toLocaleDateString();
        ent.lastUpdated = dateTime.toLocaleDateString();
        let transformedCohort = applyFilters(ent, dataMatrix);
        transformedCohort.recordsCount = transformedCohort.dataMatrix.length;
        if (!validateRecordCount(transformedCohort.recordsCount)) { return; }
        _utils.saveCohortsData(transformedCohort, projectName).then(content => {
            if (content) {
                verifyRegistration(transformedCohort)
                    .then(metrics => {
                        if (Object.keys(metrics).length !== 0) {
                            _updateProjectSettings(transformedCohort, metrics, _utils).then(() => {
                                setWaitSpinner(false);
                                dispatch({ type: 'COHORT_EDIT_PANEL_STATE', payload: false });
                            });
                        }
                    })
                    .catch((error) => {
                        // rollBackSaveCohort(ent.key, _utils);
                        setWaitSpinner(false);
                        // dispatch({ type: 'COHORT_EDIT_PANEL_STATE', payload: false });
                        throw error;
                    });
            } else {
                // rollBackSaveCohort(ent.key);
                console.log('Cohort model Registration failed');
                setWaitSpinner(false);
            }
        });
    }
    /**
    * Update the cohort.  Raise exception on failure.
    */
    const updateCohort = (_utils: Utils) => {
        let ent = {} as IDatasetType;
        let dateTime = new Date();
        ent.key = selectedDataset.key;
        ent.name = cohortName;;
        ent.isCohort = true;
        ent.masterKey = selectedDatasetOption?.key;
        ent.masterName = selectedDatasetOption?.text;
        ent.labelIndex = selectedDataset.labelIndex;
        ent.label = selectedDataset.label;
        ent.registeredModel = selectedDataset.registeredModel;
        ent.mlPlatform = selectedDataset.mlPlatform;
        ent.mlFlowRunId = selectedDataset.mlFlowRunId;
        ent.features = selectedDataset.features;
        ent.featuresValues = inEditCohort?.featuresValues;
        ent.header = selectedDataset.header;
        ent.separator = selectedDataset.separator;
        ent.filterValuesList = filterValuesList;
        ent.dataMatrix = dataMatrix;
        ent.dateCreated = selectedDataset.dateCreated;
        ent.lastUpdated = dateTime.toLocaleDateString();
        let transformedCohort = applyFilters(ent, dataMatrix);
        transformedCohort.recordsCount = transformedCohort.dataMatrix.length;
        if (!validateRecordCount(transformedCohort.recordsCount)) { return; }
        _utils.saveCohortsData(transformedCohort, projectName).then(content => {
            if (content) {
                verifyRegistration(transformedCohort)
                    .then(metrics => {
                        if (Object.keys(metrics).length !== 0) {
                            _updateProjectSettings(transformedCohort, metrics, _utils).then(() => {
                                setWaitSpinner(false);
                                dispatch({ type: 'COHORT_EDIT_PANEL_STATE', payload: false });
                            });
                        }
                    })
                    .catch((error) => {
                        // rollBackUpdateCohort(ent.key, _utils);
                        setCohortRegistrationFailedHidden(false);
                        setCohortRegistrationFailed(error);
                        console.log("Failed to register a model for this: " + error);
                        setWaitSpinner(false);
                        // dispatch({ type: 'COHORT_EDIT_PANEL_STATE', payload: false });
                        // throw error;
                    });
            } else {
                // rollBackUpdateCohort(ent.key);
                console.log('Update cohort model Registration failed');
                setWaitSpinner(false);
                dispatch({ type: 'COHORT_EDIT_PANEL_STATE', payload: false });
            }
        });
    }
    /**
    * Build the dataset options.
    */
    const datasetOptions: IChoiceGroupOption[] = [];
    let datasetsMeta = state['projectSettings']['datasets'];
    const buildDatasetOptions = () => {
        let ent = {} as IChoiceGroupOption;
        for (let i = 0; i < datasetsMeta?.length; i++) {
            /**
             * Cohort cannot be a master dataset.
            */
            if (datasetsMeta[i].name !== datasetsMeta[i].masterName) { continue; }
            ent.key = datasetsMeta[i].key;
            ent.text = datasetsMeta[i].name;

            if (inEditCohort && inEditCohort['isEditState']) {
                ent.disabled = true;
            }
            datasetOptions.push(ent);
            ent = {} as IChoiceGroupOption;
        }
    }
    buildDatasetOptions();
    if (inEditCohort && inEditCohort['isEditState']) {
        setSelectedDataset(inEditCohort);
        let dbOption = {} as IChoiceGroupOption;
        dbOption.key = inEditCohort['masterKey'];
        dbOption.text = inEditCohort['masterName'];

        SetSelectedDatasetOption(dbOption);
        setDefaultSelectedDatasetKey(inEditCohort['masterKey']);
        setCohortName(inEditCohort['name']);
        setFilterValuesList(inEditCohort['filterValuesList']);
        setDefaultCohortName(inEditCohort['name']);
        /**
         * Build a data matrix out of the features values.
        */
        setDataMatrix(buildDataMatrix(inEditCohort, true));
        updateFilters(inEditCohort);
        setFilterHidden(false);
        setCohortOptionsHidden(false);
        setSelectedDatasetOptionValidated(true);
        setBtnSaveCohortDisabled(true);
        setSelectedDatasetOptionError('');
        state['inEditCohort']['isEditState'] = false;
        inEditCohort['isEditState'] = false;
    }
    /**
      * handle the form submit event.
    */
    const handleSubmit = (event: any) => {
        if (filterValuesList) {
            let _utils = new Utils();
            if (_utils.isValidName(cohortName) && selectedDatasetOptionValidated) {
                if (duplicateName(cohortName, cohortsList) && cohortName !== defaultCohortName) {
                    setCohortNameError('Cohort name is a duplicate. Enter a new name.');
                } else {
                    setWaitSpinner(true);
                    /**
                     * Save the cohort. 
                    */
                    try {
                        updateCohort(_utils);
                        dispatch({ type: 'FILTER_VALUES_LIST', payload: filterValuesList });
                    } catch (error) {
                        console.log("Failed to register a model for this: " + error);
                        setWaitSpinner(false);
                        dispatch({ type: 'COHORT_EDIT_PANEL_STATE', payload: false });
                        throw error;
                    }
                }
            }
            else {
                setCohortNameError(COHORT_NAME_INVALID);
            }
            if (!selectedDatasetOptionValidated) {
                setSelectedDatasetOptionError('Please select a dataset');
            }
        }
        else {
            console.log("Filters list is empty")
        }
        event.preventDefault();
        event.stopPropagation();
    }
    const handleClose = () => {
        setCohortNameError('');
        setDataMatrix(undefined);
        setFilterOptions(undefined);
        setSelectedDatasetOptionValidated(false);
        setSelectedDatasetOptionError('');
        setBtnSaveCohortDisabled(true);
        setCohortRegistrationFailedHidden(true);
        setCohortRegistrationFailed('');
        state['inEditCohort'] = undefined;
        inEditCohort = undefined;
        dispatch({ type: 'COHORT_EDIT_PANEL_STATE', payload: false });
    }

    return (
        <>
            <form onSubmit={handleSubmit} id='frmCreateCohort' noValidate>
                <table className='cohortBody'>
                    <tbody>
                        <tr>
                            <td>
                                <TextField
                                    required
                                    defaultValue={defaultCohortName}
                                    componentRef={cohortNameRef}
                                    id='cohortName'
                                    label='Cohort name'
                                    styles={cohortNameStyle}
                                    placeholder='Enter a cohort name'
                                    onChange={onCohortNameChange}
                                    errorMessage={cohortNameError}
                                />
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <ChoiceGroup
                                    defaultSelectedKey={defaultSelectedDatasetKey}
                                    options={datasetOptions}
                                    onChange={onDatasetChoiceChange}
                                    label="Select dataset"
                                    disabled={true}
                                    required />
                                <span className='LabelTextErrorOutput'>{selectedDatasetOptionError}</span>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div hidden={cohortOptionsHidden}>
                                    <table>
                                        <tbody>
                                            <tr>
                                                <td>

                                                    <div hidden={filterHidden}>
                                                        <Dropdown
                                                            required
                                                            componentRef={datasetFilterRef}
                                                            id='datasetFilter'
                                                            label='Filter'
                                                            placeholder="Select an option"
                                                            options={filterOptions}
                                                            styles={dropdownStyle}
                                                            onChange={selectFilter}
                                                            errorMessage={selectedDatasetFilterError}
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <Checkbox label="Treat as categorical" styles={checkboxStyle} checked={isCategoricalChecked} onChange={onIsCategoricalChange} disabled={isCategoricalDisabled} />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <div hidden={operationHidden}>
                                                        <Dropdown
                                                            required
                                                            componentRef={operationRef}
                                                            id='operation'
                                                            label='Operation'
                                                            placeholder="Select an option"
                                                            options={operationOptions}
                                                            styles={dropdownStyle}
                                                            onChange={selectOperation}
                                                            errorMessage={selectedOperationError}
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <div hidden={operationValueHidden}>
                                                        <Dropdown
                                                            required
                                                            componentRef={operationValueRef}
                                                            id='operationValue'
                                                            label='Value'
                                                            placeholder="Select an option"
                                                            options={fieldValueOptions}
                                                            styles={dropdownStyle}
                                                            onChange={updateOperationValue}
                                                            errorMessage={operationValueError}
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <div hidden={operationMaxMinHidden}>
                                                        <Dropdown
                                                            required
                                                            componentRef={operationMinRef}
                                                            id='operationMin'
                                                            label='Minimum'
                                                            placeholder="Select an option"
                                                            options={fieldValueOptions}
                                                            styles={dropdownStyle}
                                                            onChange={updateOperationMin}
                                                            errorMessage={operationMinError}
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <div hidden={operationMaxMinHidden}>
                                                        <Dropdown
                                                            required
                                                            componentRef={operationMaxRef}
                                                            id='operationMax'
                                                            label='Maximum'
                                                            placeholder="Select an option"
                                                            options={fieldValueOptions}
                                                            styles={dropdownStyle}
                                                            onChange={updateOperationMax}
                                                            errorMessage={operationMaxError}
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <div hidden={categoricalFieldHidden}>
                                                        <Dropdown
                                                            required
                                                            multiSelect
                                                            componentRef={categoricalFieldRef}
                                                            selectedKeys={selectedCategoricalKeys}
                                                            id='categoricalField'
                                                            label='Includes'
                                                            placeholder="Select options"
                                                            options={fieldValueOptions}
                                                            styles={dropdownStyle}
                                                            onChange={updateCategoricalField}
                                                            errorMessage={categoricalFieldError}
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <PrimaryButton id="btnAddFilter" onClick={addFilter} styles={addFilerStyles} text="Add Filter" />
                                                </td>
                                            </tr>

                                            <tr>
                                                <td>
                                                    <div className='filterDupError' hidden={validateFilterHidden}>
                                                        <FontIcon aria-label="Error" iconName="ErrorBadge" className="filterDupErrorIcon" />{FILTER_ERROR}
                                                    </div>
                                                </td>
                                            </tr>
                                            {
                                                filterValuesList?.map((filter) => (
                                                    <tr key={filter.key}>
                                                        <td className='filterStyles'>
                                                            <Stack horizontal styles={stackStyles}>
                                                                <div id='filterOutputSpan'>{filter.output}</div>&nbsp;&nbsp;
                                                                <span id='deleteFilterSpan'>
                                                                    <ActionButton title='Clear filter' id={filter.key} className='clearFiltersStyles' iconProps={clearIcon} onClick={clearFilter} />
                                                                </span>
                                                            </Stack>
                                                        </td>
                                                    </tr>
                                                ))
                                            }
                                            <tr>
                                                <td>
                                                    <Stack horizontal styles={stackStyles}>
                                                        <span>
                                                            <ActionButton title='Clear all filters' className="clearFiltersStyles" iconProps={clearIcon} onClick={clearAllFilters} text="Clear all filters" />
                                                        </span>
                                                    </Stack>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <div className='filterDupError' hidden={recordsCountErrorHidden}>
                                                        {RECORDS_COUNT_ERROR}
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <div className='filterDupError' hidden={cohortRegistrationFailedHidden}>
                                                        {cohortRegistrationFailed}
                                                    </div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </td>
                        </tr>

                        <tr>
                            <td>
                                {waitSpinner ? (<Spinner size={SpinnerSize.medium} label="Verifying your cohort against models with the same test dataset, please wait..." ariaLive="assertive" labelPosition="bottom" />) : (
                                    <></>
                                )}
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div className="cohortFooter">
                    <PrimaryButton id="btnSaveCohort" type='submit' styles={buttonStyles} text="Save" disabled={btnSaveCohortDisabled} />
                    <DefaultButton onClick={handleClose} text="Cancel" />
                </div>
            </form>
        </>
    );
}

