// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React from 'react';
import { useState } from 'react';
import { UUID } from 'angular2-uuid';
import { PathExt } from '@jupyterlab/coreutils'
import { Label } from '@fluentui/react/lib/Label';
import { useSelector, useDispatch } from 'react-redux';
import { TextField, ITextFieldStyles } from '@fluentui/react/lib/TextField';
import { Modal, Stack, IStackTokens, IIconProps, IModal } from '@fluentui/react';
import { DefaultButton, IconButton, PrimaryButton } from '@fluentui/react/lib/Button';
import {
    Dropdown,
    IDropdown,
    IDropdownStyles,
    IDropdownOption
} from '@fluentui/react/lib/Dropdown';
import {
    IProjectType,
    INotebookType,
    IMetricsType,
    INotebookMetricsType,
    IColorValuesType
} from '../../../core/components';
import '../../../../style/modals.css';
import { Utils } from '../../../core/utils';
import { UploadUtil } from '../../../core/uploadUtil';
import { CreateRun } from '../../../core/mlflowUtils';
import { NotebookUtils } from '../../../core/notebookUtils';

export const NewProjectModal: React.FunctionComponent = () => {
    const ARTIFACTS_DIR = 'artifacts';
    const NOTEBOOK_DISPLAY = 20;    
    const PROJECT_NAME_VALIDATION_MESSAGE = 'Name length should be between 1 and 100 characters, and not include “/“, “\”, "<", ">", "?", or “:”';
    const PROJECT_NAME_COLLISION = "Project name already exists in your workspace.  Choose a different one."
    const FILE_TYPE_ERROR_MESSAGE = "Only notebooks are supported.  Please try again.";
    const titleId = "newProjectModalId";
    /**
     * Inline fluent styles   
    */
    const projectNameInput: Partial<ITextFieldStyles> = {
        fieldGroup: { width: 450, height: 32 }
    };
    const projectTypeStyles: Partial<IDropdownStyles> = {
        dropdown: { width: 300, height: 32 },
        dropdownOptionText: { overflow: 'visible', whiteSpace: 'normal' },
        dropdownItem: { height: 'auto' },
    };
    /**
     * App state and refs
    */
    const dispatch = useDispatch();
    const state = useSelector((state) => state);
    const showModal = state['projectModalState'];
    const workspaceSettings = state['workspaceSettings'];
    const serverUri = state['serverUri'];
    let [uploadFileTypeHidden, setUploadFileTypeHidden] = useState(true);
    let [uploadFileTypeError, setUploadFileTypeError] = useState("");
    const [projectNameValidated, setProjectNameValidated] = useState(false);
    const [projectTypeValidated, setIProjectTypeValidated] = useState(false);
    const [projectNameErrorHidden, setProjectNameErrorHidden] = useState(false);

    const [TextfieldErrorValue, setTextfieldErrorValue] = useState('');
    const [dropdown_error_msg, setDropdownErrorValue] = useState('');
    const [uploadedNotebook, setUploadedNotebook] = useState('');
    const cancelIcon: IIconProps = { iconName: 'Cancel' };
    const stackTokens: IStackTokens = { childrenGap: 15 };
    const ModalRef = React.createRef<IModal>();
    const dropdownRef = React.createRef<IDropdown>();
    /**
     * Project problem types options.
    */
    let [problemType, setProblemType] = useState<string>();
    let [problemTypeKey, setProblemTypeKey] = useState<string>();
    const options: IDropdownOption[] = [];
    const problemTypes = state['problemTypes'];
    for (let i = 0; i < problemTypes?.length; i++) {
        options.push({ key: problemTypes[i]['key'], text: problemTypes[i]['name'] });
    }
    /**
     * Project name change.
     * @param event 
    */
    const HandleChangeProject = (event: any) => {
        if (event.target.value !== '') {
            setProjectNameValidated(true);
            setTextfieldErrorValue('');
        }
    }
    /**
     * Check whether a name is a valid file or folder name.
     * Disallows names with zero length, and "/", and "\", and ":" in file names.
     * @param name 
     * @returns 
    */
    const isValidName = (name: string): boolean => {
        const validNameExp = /[\/\\\<\>\?:]/;
        if (!name.replace(/\s/g, '').length) {
            return false;
        }
        return name.length > 0 && name.length < 101 && !validNameExp.test(name);
    }


    /**
     * 
     * @param projectName 
     * @returns 
    */
    const isValidProjectName = (projectName: string): boolean => {
        if (workspaceSettings && workspaceSettings?.length !== 0 && workspaceSettings?.projectList) {
            for (let p of workspaceSettings?.projectList) {
                if (p && p.name.toLowerCase().trim() === projectName.toLowerCase().trim()) {
                    return false;
                }
            }
        } else {
            return true;
        }
        /**
         * a new project name.  always valid.
        */
        return true;
    }
    /**
     * Validate project name.
     * @param input 
     * @returns 
    */
    const ValidateProjectName = (input: string, _utils: Utils): boolean => {
        if (isValidProjectName(input) === false) {
            setTextfieldErrorValue(PROJECT_NAME_COLLISION);
            setProjectNameValidated(false);
            return false;
        } else if (!_utils.isValidName(input)) {
            setTextfieldErrorValue(PROJECT_NAME_VALIDATION_MESSAGE);
            setProjectNameValidated(false);
            return false;
        } else {
            setProjectNameValidated(true);
            setTextfieldErrorValue('');
            return true;
        }
    }
    /**
     * Project types options
     * @param event 
    */
    const HandleChangeProjectType = (event, option, index) => {
        if (event.currentTarget.textContent !== '') {
            setIProjectTypeValidated(true);
            setDropdownErrorValue('');
            setProblemType(option.text);
            setProblemTypeKey(option.key);
        }
    }
    /**
     * Calls the upload files method.
     * @param file 
     * @returns 
    */
    const _onInputChanged = async (projectName: string, file: File) => {
        const _uploadUtil = new UploadUtil();
        const res = await _uploadUtil.UploadFile(file, projectName, ARTIFACTS_DIR);
        const response = await res;
        return response;
    }
    /**
     * Identify the notebook name being uploaded    
    */
    const uploadNotebookChange = (event) => {
        if (event.target.files.length !== 0) {
            let fileName = event.target.files[0].name;
            if (PathExt.extname(fileName) !== '.ipynb') {
                setUploadFileTypeHidden(false);
                setUploadFileTypeError(FILE_TYPE_ERROR_MESSAGE);
                setUploadedNotebook('');
                return;
            } else {
                let _utils = new Utils();
                setUploadFileTypeHidden(true);
                setUploadFileTypeError('');
                setUploadedNotebook(_utils.nbNameDisplay(fileName, NOTEBOOK_DISPLAY));
            }
        }
    }
    /**
     * Create the project folder that will hosts all project resources.
     * @returns 
    */
    const createProjectFolder = async (projectName: string, _utils: Utils) => {
        return _utils.CreateProjectFolder(projectName)
            .then(response => {
                return response;
            })
            .catch((error: Error) => {
                return false;
            });
    }
    /**
     * Create the project settings file.
     * @param project 
     * @returns 
    */
    const createProjectFile = async (projectSettings: IProjectType, _utils: Utils) => {
        return _utils.CreateProjectSettingsFile(projectSettings)
            .then(response => {
                return response;
            })
            .catch((error: Error) => {
                return false;
            });
    }
    /**
     *  Create the project settings file.
     * @param project 
     * @param notebookName 
     * @param mlflowRunId 
     * @returns 
    */
    const createProjectData = (project: IProjectType, notebookName: string, mlflowRunId: string) => {
        let dateTime = new Date();
        let notebook_arr = [];
        let notebook = {} as INotebookType;
        if (notebookName) {
            let metricsArr: IMetricsType[] = [];
            let notebookMetricsArr: INotebookMetricsType[] = [];
            let notebookMetrics = {} as INotebookMetricsType;
            notebookMetrics.key = "";
            notebookMetrics.name = "";
            notebookMetrics.metricsVisible = true;
            notebookMetrics.mapTo = '';
            notebookMetrics.metrics = metricsArr
            notebookMetricsArr.push(notebookMetrics);

            notebook.name = notebookName;
            notebook.notebookVisible = false;
            notebook.key = UUID.UUID();
            notebook.mlFlowRunId = mlflowRunId;
            notebook.testDataset = '';
            notebook.testDatasetKey = '';
            notebook.registeredModel = '';
            notebook.dateCreated = dateTime.toTimeString();
            notebook.lastUpdated = dateTime.toTimeString();
            notebook.metrics = notebookMetricsArr;
            notebook_arr.push(notebook);
        }
        project.problemType = problemType;
        project.problemTypeKey = problemTypeKey;
        if (project.problemType && project.problemType.toLowerCase() === 'classification') {
            project.problemTypeMajorMetric = 'Accuracy';
        } else if (project.problemType && project.problemType.toLowerCase() === 'regression') {
            project.problemTypeMajorMetric = 'mae';
        }
        else {
            project.problemTypeMajorMetric = '';
        }
        let datasets_arr = [];
        let selectedMetrics: string[] = [];
        let selectedCohorts: string[] = [];
        let selectedModels: string[] = [];
        if (notebookName) {
            project.baseNotebookModel = notebookName;
            project.baseNotebookModelKey = notebook.key;
        }
        else {
            project.baseNotebookModel = "";
            project.baseNotebookModelKey = "";
        }
        project.notebooks = notebook_arr;
        project.selectedMetrics = selectedMetrics;
        project.selectedCohorts = selectedCohorts;
        project.selectedModels = selectedModels;
        project.notebooksRestorer = [];
        project.enableCompareModelBtn = false;
        project.resetColorsDefault = true;
        project.activeLeftWidgetId = '';
        project.activeMainWidgetId = '';
        const heatmapColors = {} as IColorValuesType;
        project.heatmapColors = heatmapColors;
        project.datasets = datasets_arr;
        project.showCompareModels = false;
        project.toggleVisualDisplay = true;
        project.absoluteVisualDisplay = false;
        project.baselineVisualDisplay = true;
        project.dateCreated = dateTime.toTimeString();
        project.lastUpdated = dateTime.toTimeString();

        return project;
    }
    /**
     * Update teh workspace settings.
     * @param projectName 
     * @returns 
    */
    async function updateWorkspaceSettingsFile(projectName: string, projectKey: string, _utils: Utils) {
        return _utils.CreateWorkspaceSettingsFile(projectName, projectKey, state)
            .then(response => {
                return response;
            })
            .catch((error: Error) => {
                return undefined;
            });
    }
    /**
      * Create an mlflow run id for each notebook
    */
    const createMlFlowRun = async () => {
        return CreateRun(serverUri)
            .then(response => {
                return response;
            })
            .catch((error: Error) => {
                return error.message;
            });
    }
    /**
     * 
     * @param projectName 
     * @param projectId 
     * @param serverUri 
     * @returns 
    */
    const _createNewNotebook = (projectName: string = undefined, projectId: string = undefined, serverUri: string = undefined): Promise<INotebookType> => {
        const notebookUtils = new NotebookUtils();
        return notebookUtils.CreateNewNotebook(projectName, projectId, serverUri)
            .then(response => {
                return response;
            })
            .catch((error: Error) => {
                return undefined;
            })
    }
    /**
     * 
     * @param project 
     * @param notebookName 
     * @param mlflowRunId 
    */
    const createProjectResources = async (project: IProjectType, notebookName: string, mlflowRunId: string, _utils: Utils, newNotebook: boolean = false) => {
        const serverUri = state['serverUri'];
        /**
         * Create the project data settings.
        */
        const projectSettings = createProjectData(project, notebookName, mlflowRunId);
        createProjectFile(projectSettings, _utils).then(content => {
            if (content) {
                updateWorkspaceSettingsFile(project.name, project.key, _utils).then(resp => {
                    if (resp) {
                        if (newNotebook) {
                            _createNewNotebook(project.name, project.key, serverUri).then(notebook => {
                                if (notebook) {

                                    projectSettings.notebooks.push(notebook);
                                    dispatch({ type: 'NEW_PROJECT_MODAL_STATE', payload: false });
                                    dispatch({ type: 'PROJECT_SETTINGS', payload: projectSettings });
                                    /**
                                     * restore nothing from previous project.
                                    */
                                    state['restoreNotebooks'](null);
                                    /**
                                     * reset state.
                                    */
                                    handleClose();
                                    dispatch({ type: 'NOTEBOOKS_RESTORER', payload: [] });
                                    window.location.reload();
                                }
                            }).catch((error: Error) => {
                                console.warn('Failed to create an empty notebook');
                            })
                        } else {
                            handleClose();
                            dispatch({ type: 'NOTEBOOKS_RESTORER', payload: [] });
                            window.location.reload();
                        }
                    }
                });
            }
        });
    }
    /**
     * handle the form submit event  
    */
    const handleSubmit = (event: any) => {
        const currentEvent = event.currentTarget;
        let _utils = new Utils();
        if (!ValidateProjectName(currentEvent.project_name.value, _utils) || !projectTypeValidated) {
            if (!projectNameValidated) {
                setProjectNameErrorHidden(false);
            }
            else {
                setProjectNameErrorHidden(true);
            }
            if (dropdownRef.current.selectedOptions.length === 0) {
                setDropdownErrorValue('Please select a project type');
            }
            else {
                setDropdownErrorValue('');
            }
            event.preventDefault();
            event.stopPropagation();
        }
        else {
            let project = {} as IProjectType;
            project.key = UUID.UUID();
            project.name = currentEvent.project_name.value.trim();
            /**
             * Create the project folder.  Use a GUID for identification.  
             * Create project entities (datasets, models, cohorts) folders. 
            */
            createProjectFolder(project.name, _utils).then(content => {
                if (content) {
                    console.warn('Project folder created successfully');
                    /**
                     * Upload notebook info
                    */
                    let notebookName: string = '';
                    const notebooks = Array.prototype.slice.call(currentEvent.upload_notebook.files) as File[];
                    if (notebooks.length !== 0) {
                        notebookName = notebooks[0].name;
                        const notebook = notebooks[0];
                        if (PathExt.extname(notebookName) === '.ipynb') {
                            setUploadFileTypeError('');
                            _onInputChanged(project.name, notebook).then(content => {
                                if (content) {
                                    console.warn('Notebook uploaded successfully');
                                    /**
                                     * Create a mlflow run 
                                    */
                                    createMlFlowRun().then(mlflowRunId => {
                                        if (mlflowRunId) {
                                            createProjectResources(project, notebookName, mlflowRunId, _utils);
                                        }
                                        else {
                                            console.log('mlflow run creation failed');
                                        }
                                    });

                                }
                            }).catch(error => {
                                console.warn('Upload Error : ' + error);
                            });
                        }
                        else {
                            notebookName = undefined;
                            setUploadFileTypeError(FILE_TYPE_ERROR_MESSAGE);
                        }
                    } else {
                        createMlFlowRun().then(mlflowRunId => {
                            if (mlflowRunId) {
                                createProjectResources(project, notebookName, mlflowRunId, _utils, true);
                            }
                            else {
                                console.log('mlflow run creation failed');
                            }

                        });
                    }
                } else {
                    console.log("failed to create project directories.  Refresh your browser and try again.  If the issue persists, please send us a bug report. ");
                }
            }).catch((error: Error) => {                
                console.log("failed to create project directories: " + error.message);
            })
            event.preventDefault();
            event.stopPropagation();
        }
    };
    /**
     * Close the new project modal.
    */
    const handleClose = () => {
        setProjectNameValidated(false);
        setIProjectTypeValidated(false);
        setTextfieldErrorValue('');
        setDropdownErrorValue('');
        setTextfieldErrorValue('');
        setUploadedNotebook('');        
        setUploadFileTypeError('');
        dispatch({ type: 'NEW_PROJECT_MODAL_STATE', payload: false });
    }

    return (
        <div>
            <Modal
                titleAriaId={titleId}
                isOpen={showModal}
                onDismiss={handleClose}
                isBlocking={false}
                containerClassName={contentStyles.container}
                componentRef={ModalRef}
            >
                <div className='modalFluent'>
                    <form onSubmit={handleSubmit} id='fromCreateProject' noValidate >
                        <div className='modalFluentHeader'>
                            <Label className='modalLabelHeader'>Create a New Project</Label>
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
                                        <td colSpan={3}>
                                            <Label className='projectLabelText' required>Project Name</Label>
                                            <TextField
                                                id='project_name'
                                                styles={projectNameInput}
                                                placeholder='Clarify the project goal (e.g. What problems to solve)'
                                            />
                                        </td >
                                    </tr>
                                    <tr>
                                        <td className='LabelTextErrorOutput' colSpan={3}>
                                            <div hidden={projectNameErrorHidden}>
                                                {TextfieldErrorValue}&nbsp;
                                            </div>
                                        </td >

                                    </tr>
                                    <tr>
                                        <td colSpan={3}>
                                            <Label className='projectLabelText' required>Project Type</Label>
                                            <Dropdown
                                                componentRef={dropdownRef}
                                                id='project_type'
                                                placeholder="Select an option"
                                                options={options}
                                                styles={projectTypeStyles}
                                                onChange={HandleChangeProjectType}

                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='LabelTextErrorOutput' colSpan={3}><span>{dropdown_error_msg}&nbsp;</span></td >
                                    </tr>
                                    <tr>
                                        <td >
                                            <Label className='projectLabelText'>Upload Notebook</Label>
                                            <Label className='projectLabelChooseFile' id="labelUploadNotebook"><span className='spanChooseFile'>Select File</span>
                                                <input onChange={uploadNotebookChange} type="file" multiple={true} name='upload_notebook' placeholder='Upload Notebook' className='btnUploadFile' />
                                            </Label>
                                        </td >
                                        <td className='projectLabelTextOutput' colSpan={2}>
                                            <span>&nbsp;{uploadedNotebook}</span>
                                        </td >
                                    </tr>

                                    <tr hidden={uploadFileTypeHidden}>
                                        <td className='LabelTextErrorOutput' colSpan={3}><span>&nbsp;{uploadFileTypeError}&nbsp;</span></td >
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className='modalFluentFooter'>
                            <Stack horizontal tokens={stackTokens}>
                                <PrimaryButton secondaryText="Create a new notebook" type='submit' text="Create" />
                                <DefaultButton onClick={handleClose} text="Cancel" />
                            </Stack>
                        </div>
                    </form>
                </div>
            </Modal>

        </div>
    );
};

import { getTheme, mergeStyleSets, FontWeights } from '@fluentui/react';

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
        padding: '0 24px 24px 24px',
        overflowY: 'hidden',
        selectors: {
            p: { margin: '14px 0' },
            'p:first-child': { marginTop: 0 },
            'p:last-child': { marginBottom: 0 },
        },
    },
});