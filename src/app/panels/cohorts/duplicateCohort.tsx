// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React from 'react';
import { useState } from 'react';
import { UUID } from 'angular2-uuid';
import { Label } from '@fluentui/react/lib/Label';
import { useSelector, useDispatch } from 'react-redux';
import { PrimaryButton, DefaultButton } from '@fluentui/react/lib/Button';
import { TextField, ITextFieldStyles } from '@fluentui/react/lib/TextField';
import { Dialog, DialogType, DialogFooter } from '@fluentui/react/lib/Dialog';
import {
    Stack,
    IStackTokens,
    IStackStyles,
    IStackItemStyles,
    TooltipHost
} from '@fluentui/react';
import { Utils } from '../../../core/utils';
import { IDatasetType } from '../../../core/components';
import { updateCohortsList, duplicateName } from './cohortUtils';

export const DuplicateCohort: React.FunctionComponent = (props) => {
    const COHORT_NAME_INVALID = 'Name length should be between 1 and 100 characters, and not include “/“, “\”, "<", ">", "?", or “:”';
    /**
     * retrieve the app state.
    */
    const dispatch = useDispatch();
    const state = useSelector((state) => state);
    const projectSettings = state['projectSettings'];
    const projectName = projectSettings['name'];
    const showDialog = state['cohortDuplicateDialogHiddenState'];
    let cohortKey = '';
    let cohortName = '';
    let cohort: IDatasetType;
    let cohortsList: any;
    const children = props.children;
    if (children) {
        cohortKey = children['cohortKey'];
        cohortName = children['cohortName'];
        cohort = children['cohort'];
        cohortsList = children['cohortsList'];
    }
    /**
     * New cohort default settings.
    */
    const containerStackTokens: IStackTokens = {
        childrenGap: 5,
    };
    const stackStyles: IStackStyles = {
        root: {
            marginBottom: 20,
        }
    };
    const stackItemStyles: IStackItemStyles = {
        root: {
            width: 150,
        },
    };
    const modelProps = {
        isBlocking: false,
        styles: { main: { width: 340 } },
    };

    const dialogContentProps = {
        type: DialogType.largeHeader,
        title: 'Duplicate cohort',
    };
    const cohortNameInputStyle: Partial<ITextFieldStyles> = {
        fieldGroup: { width: 250, height: 32 }
    };
    const [duplicatedCohortName, setDuplicatedCohortName] = useState('');
    const [cohortNameError, setCohortNameError] = useState('');
    /**
     * Edit cohort name.
     * @param event 
     */
    const onCohortNameChange = event => {
        if (event.target.value !== '') {
            setDuplicatedCohortName(event.target.value);
            setCohortNameError('');
        }
    }
    /**
     * Save the cohort.
     * @param cohort 
     * @returns 
     */
    const _saveCohort = async (cohort: IDatasetType, _utils: Utils) => {
        return _utils.saveCohortsData(cohort, projectName)
            .then(response => {
                return response;
            })
            .catch((error: Error) => {
                return false;
            });
    }
    /**
     * Get Cohort data.
    */
    const getCohortData = async (cohortKey: string, _utils: Utils): Promise<IDatasetType> => {
        return _utils.GetCohortData(projectName, cohortKey)
            .then(response => {
                return response;
            })
            .catch((error: Error) => {
                return null;
            });
    }
    /**
     * Update the project settings.
    */
    const _updateProjectSettings = async (dupCohort: IDatasetType, prevCohort: IDatasetType, _utils: Utils) => {
        let datasets = projectSettings['datasets'];

        let datasetsCohort = Object.assign({}, dupCohort);
        datasetsCohort.dataMatrix = [];
        datasetsCohort.featuresValues = [];
        datasets.push(datasetsCohort);

        let _selectedCohorts = projectSettings['selectedCohorts'];
        if (!_selectedCohorts.includes(datasetsCohort.name)) {
            _selectedCohorts.push(datasetsCohort.name);
        }
        if (!cohortsList) {
            cohortsList = [];
            console.log("cohorts list should not be empty.")
        }
        updateCohortsList(cohortsList, dupCohort).then(content => {
            if (content) {
                dispatch({ type: 'UPDATE_COHORT_SETTINGS_LIST', payload: content });
                dispatch({ type: 'SELECTED_COHORTS_VISUAL', payload: _selectedCohorts });
                return _utils.UpdateProjectSettings(projectSettings, undefined, undefined, undefined, undefined, datasets, _selectedCohorts, undefined, undefined, dupCohort, prevCohort)
                    .then(response => {
                        return response;
                    })
                    .catch((error: Error) => {
                        return undefined;
                    });
            }
            else {
                return undefined;
            }
        });
    }
    /**
     * Duplicate cohort.  
     * Raise exception on failure.
    */
    const duplicateCohort = (_utils: Utils) => {
        let prevCohort = {} as IDatasetType;
        let dupCohort = {} as IDatasetType;
        getCohortData(cohortKey, _utils).then(content => {
            if (content) {
                prevCohort = Object.assign({}, content);
                dupCohort = Object.assign({}, content);
                dupCohort.key = UUID.UUID();
                dupCohort.name = duplicatedCohortName;
                const dateTime = new Date();
                dupCohort.dateCreated = dateTime.toLocaleDateString();
                dupCohort.lastUpdated = dateTime.toLocaleDateString();
                _saveCohort(dupCohort, _utils).then(content => {
                    if (content) {
                        _updateProjectSettings(dupCohort, prevCohort, _utils).then(resp => {
                            //do nothing
                            _utils= undefined;
                        });
                    }
                });
            }
        });
    }
    /**
     * Process create duplicate cohort.
    */
    const confirmDuplicate = () => {
        let _utils = new Utils();
        if (_utils.isValidName(duplicatedCohortName) && cohortName !== duplicatedCohortName) {
            if (duplicateName(duplicatedCohortName, cohortsList)) {
                setCohortNameError('Cohort name is a duplicate. Try again with a new name.');
            } else {
                duplicateCohort(_utils);
                setCohortNameError('');
                dispatch({ type: 'COHORT_DUPLICATE_DIALOG_STATE', payload: true });
            }
        }
        else {
            setCohortNameError(COHORT_NAME_INVALID);
        }
    }
    const onDismiss = () => {
        dispatch({ type: 'COHORT_DUPLICATE_DIALOG_STATE', payload: true });
    }

    return (
        <Dialog
            hidden={showDialog}
            onDismiss={onDismiss}
            dialogContentProps={dialogContentProps}
            modalProps={modelProps}
        >
            <Stack tokens={containerStackTokens}>
                <Stack horizontal tokens={{ childrenGap: "10px" }}>
                    <Stack.Item styles={stackItemStyles}>
                        <TooltipHost content='Cohort name'>
                            <Label className="cohortDialogHeaders">Cohort name:</Label>
                        </TooltipHost>
                    </Stack.Item>
                    <Stack.Item>
                        <Label className="cohortLabel">{cohortName}</Label>
                    </Stack.Item>
                </Stack>
                <Stack horizontal={false} styles={stackStyles}>
                    <Stack.Item>
                        <TooltipHost content='Cohort name'>
                            <Label className="cohortHeaders" required>New cohort name </Label>
                        </TooltipHost>
                    </Stack.Item>
                    <Stack.Item>
                        <TextField
                            id='cohortName'
                            styles={cohortNameInputStyle}
                            placeholder='Enter a new cohort name'
                            errorMessage={cohortNameError}
                            onChange={onCohortNameChange} />
                    </Stack.Item>
                </Stack>
            </Stack>
            <DialogFooter>
                <PrimaryButton onClick={confirmDuplicate} text="Duplicate" />
                <DefaultButton onClick={onDismiss} text="Cancel" />
            </DialogFooter>
        </Dialog>
    );
}