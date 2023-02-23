// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React from 'react';
import { useState } from 'react';
import { Label } from '@fluentui/react/lib/Label';
import { useSelector, useDispatch } from 'react-redux';
import { TextField, ITextFieldStyles } from '@fluentui/react/lib/TextField';
import {
    DefaultButton,
    IconButton,
    PrimaryButton
} from '@fluentui/react/lib/Button';
import {
    Dropdown,
    IDropdown,
    IDropdownStyles,
    IDropdownOption
} from '@fluentui/react/lib/Dropdown';
import {
    Modal,
    Stack,
    IStackTokens,
    IIconProps,
    getTheme,
    mergeStyleSets,
    FontWeights
} from '@fluentui/react';
import '../../../../style/modals.css';
import { Utils } from '../../../core/utils';

export const PropertiesModal: React.FunctionComponent = () => {
    /**
     * App state.
    */
    const dispatch = useDispatch();
    const state = useSelector((state) => state);
    const titleId = "projectPropertiesModalId";
    const problemTypes = state['problemTypes'];
    const projectSettings = state['projectSettings'];
    const projectName = state['projectSettings']['name'];
    const showModal = state['projectPropertiesModalState'];
    let selectedProblemType = state['selectedProblemType'];
    const selectedProblemTypeMajorMetric = state['selectedProblemTypeMajorMetric'];
    if (selectedProblemType!.key.length === 0 && selectedProblemType!.text.length === 0) {
        selectedProblemType.key = state['projectSettings']['problemTypeKey'];
        selectedProblemType.text = state['projectSettings']['problemType'];
    }
    const cancelIcon: IIconProps = { iconName: 'Cancel' };
    const stackTokens: IStackTokens = { childrenGap: 15 };
    const projectTypeRef = React.createRef<IDropdown>();
    const projectTypeMetricsRef = React.createRef<IDropdown>();
    let items: IDropdownOption[];
    const options: IDropdownOption[] = [];
    /**
     * Project problem types options.
    */
    for (let i = 0; i < problemTypes?.length; i++) {
        options.push({ key: problemTypes[i]['key'], text: problemTypes[i]['name'] });
        if (problemTypes[i]['name'] === selectedProblemType.text) {
            items = [];
            for (let pt in problemTypes[i]['metrics']) {
                items.push({ key: pt, text: pt });
            }
        }
    }
    /**
     * Set teh selected problem type option, and update the app state.     
    */
    const [optionMetrics, setOptionMetrics] = useState(items);
    
    const updateProblemType = (event, option, index) => {
        items = [];
        for (let pt in problemTypes[index]['metrics']) {
            items.push({ key: pt, text: pt });
        }
        dispatch({ type: 'SELECTED_PROBLEM_TYPE', payload: option });
        setOptionMetrics(items);
    }
    /**
     * Update hte major metric UI.
     * @param event 
     * @param option 
     * @param index 
    */
    const updateMetrics = (event, option, index) => {
        dispatch({ type: 'SELECTED_PROBLEM_TYPE_MAJOR_METRIC', payload: option });
    }
    /**
     * Update project settings and app state.
     * @param projectSettings 
     * @param projectName 
     * @param projectType 
     * @param projectTypeKey 
     * @param majorMetric 
     * @returns 
    */
    const updateProjectSettings = async (projectSettings: any, projectName: string, projectType: string, projectTypeKey: string, majorMetric: string = undefined) => {
        const _utils = new Utils();
        return _utils.UpdateProjectSettings(projectSettings, projectName, projectType, projectTypeKey, majorMetric)
            .then(response => {
                return response;
            })
            .catch((error: Error) => {
                return false;
            });
    }

    /**
     * handle the form submit event  
    */
    const handleSubmit = event => {
        const current_event = event.currentTarget;
        let _isMetricUpdate = false;
        /**
         * form submit level values
         */
        let projectName: string = undefined;
        let projectType: string = undefined;
        let projectTypeKey: string = undefined;
        let majorMetric: string = undefined;
        if (projectTypeMetricsRef.current.selectedOptions.length !== 0 && projectTypeMetricsRef.current!.selectedOptions[0].text !== projectSettings.problemTypeMajorMetric) {
            majorMetric = projectTypeMetricsRef.current!.selectedOptions[0].text;
            _isMetricUpdate = true;
        }
        if (_isMetricUpdate) {
            updateProjectSettings(projectSettings, projectName, projectType, projectTypeKey, majorMetric).then(content => {
                if (content) {
                    dispatch({ type: 'PROJECT_PROPERTIES_STATE', payload: projectSettings });
                }
            });
        }
        dispatch({ type: 'PROJECT_PROPERTIES_MODAL_STATE', payload: false });
        event.preventDefault();
        event.stopPropagation();
    };
    /**
     * Inline required fluent styles   
    */
    const projectNameInput: Partial<ITextFieldStyles> = {
        fieldGroup: { width: 350, height: 32 }
    };
    const projectTypeStyles: Partial<IDropdownStyles> = {
        dropdown: { width: 200, height: 32 },
        dropdownOptionText: { overflow: 'visible', whiteSpace: 'normal' },
        dropdownItem: { height: 'auto' },
    };
    /**
      * Handle the window close and any other required cleaning.
     */
    const handleClose = () => {
        dispatch({ type: 'PROJECT_PROPERTIES_MODAL_STATE', payload: false });
    }
    return (
        <div>
            <Modal
                titleAriaId={titleId}
                isOpen={showModal}
                onDismiss={handleClose}
                isBlocking={false}
                containerClassName={contentStyles.container}
            >
                <div className={contentStyles.body}>
                    <form onSubmit={handleSubmit} id='frm_create_project' noValidate >
                        <div className='modalFluentHeader'>
                            <Label className='modalLabelHeader'>Project Properties</Label>
                            <IconButton
                                className='iconButtonStyles'
                                iconProps={cancelIcon}
                                label="Close popup modal"
                                onClick={handleClose}
                            />
                        </div>
                        <div>
                            <table className='projectModalFluentBody'>
                                <tbody>
                                    <tr>
                                        <th>
                                            <Label className='projectLabelText' required>Project Name</Label>
                                            <TextField id='projectName'
                                                styles={projectNameInput}
                                                placeholder='Clarify the project goal (e.g. What problems to solve)'
                                                defaultValue={projectName}
                                                disabled
                                            />
                                        </th>
                                    </tr>
                                    <tr><th>&nbsp;</th></tr>
                                    <tr>
                                        <th>
                                            <Label className='projectLabelText' required>Project Type</Label>
                                            <Dropdown
                                                defaultSelectedKey={selectedProblemType && selectedProblemType.key}
                                                componentRef={projectTypeRef}
                                                id='projectType'
                                                placeholder="Select an option"
                                                options={options}
                                                styles={projectTypeStyles}
                                                onChange={updateProblemType}
                                                disabled
                                            />

                                        </th>
                                    </tr>
                                    <tr><th>&nbsp;</th></tr>
                                    <tr>
                                        <th>
                                            <Label className='projectLabelText'>Major Metric</Label>
                                            <Dropdown
                                                defaultSelectedKey={selectedProblemTypeMajorMetric && selectedProblemTypeMajorMetric.key}
                                                componentRef={projectTypeMetricsRef}
                                                id='projectTypeMetrics'
                                                placeholder="Select an option"
                                                options={optionMetrics}
                                                styles={projectTypeStyles}
                                                onChange={updateMetrics}
                                            />
                                        </th>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className='modalFluentFooter'>
                            <Stack horizontal tokens={stackTokens} >
                                <PrimaryButton secondaryText="Create a new notebook" type='submit' text="Confirm" />
                                <DefaultButton onClick={handleClose} text="Cancel" />
                            </Stack>
                        </div>
                    </form>
                </div>
            </Modal>
        </div>
    );
};


const theme = getTheme();
const contentStyles = mergeStyleSets({
    container: {
        display: 'flex',
        flexFlow: 'column nowrap',
        alignItems: 'stretch',
    },
    header: [
        // eslint-disable-next-line deprecation/deprecation
        theme.fonts.xLargePlus,
        {
            flex: '1 1 auto',
            borderTop: `4px solid ${theme.palette.themePrimary}`,
            color: theme.palette.neutralPrimary,
            display: 'flex',
            alignItems: 'center',
            fontWeight: FontWeights.semibold,
            padding: '12px 12px 14px 24px',
        },
    ],
    body: {
        flex: '4 4 auto',
        padding: '0 20px 0px 20px',
        overflowY: 'hidden',
        selectors: {
            p: { margin: '14px 0' },
            'p:first-child': { marginTop: 0 },
            'p:last-child': { marginBottom: 0 },
        },
    },
});


