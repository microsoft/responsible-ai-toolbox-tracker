// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import {
    IWorkspaceType,
    IProjectType,
    IMetricsType,
    INotebookType,
    INotebookMetricsType,
    IDatasetType,
    IColorValuesType
} from './components'
import { Store } from "redux";
import { NotebookPanel } from '@jupyterlab/notebook';

const FILTER_VALUES_LIST = "FILTER_VALUES_LIST";
const SET_COMPARE_MODELS_OPENER = "SET_COMPARE_MODELS_OPENER";
const REFRESH_NOTEBOOK_LIST = "REFRESH_NOTEBOOK_LIST";
const NEW_PROJECT_MODAL_STATE = "NEW_PROJECT_MODAL_STATE";
const DELETE_PROJECT_MODAL_STATE = "DELETE_PROJECT_MODAL_STATE";
const CONFIRM_DELETE_PROJECT_MODAL_STATE = "CONFIRM_DELETE_PROJECT_MODAL_STATE";
const CONFIRM_DELETE_PROJECT_INFO = "CONFIRM_DELETE_PROJECT_INFO";
const MODEL_REGISTRATION_MODAL_STATE = "MODEL_REGISTRATION_MODAL_STATE";
const EDIT_MODEL_REGISTRATION_MODAL_STATE = "EDIT_MODEL_REGISTRATION_MODAL_STATE";
const MODEL_REGISTRATION_STATE = "MODEL_REGISTRATION_STATE";
const IN_EDIT_NOTEBOOK_ID = "IN_EDIT_NOTEBOOK_ID";
const IN_REGISTER_NOTEBOOK_ID = "IN_REGISTER_NOTEBOOK_ID";
const SWITCH_PROJECT_MODAL_STATE = "SWITCH_PROJECT_MODAL_STATE";
const SWITCH_PROJECT_STATE = "SWITCH_PROJECT_STATE";
const IMPORT_NOTEBOOK_MODAL_STATE = "IMPORT_NOTEBOOK_MODAL_STATE";
const PROJECT_PROPERTIES_MODAL_STATE = "PROJECT_PROPERTIES_MODAL_STATE";
const PROJECT_PROPERTIES_STATE = "PROJECT_PROPERTIES_STATE";
const SELECTED_PROBLEM_TYPE = "SELECTED_PROBLEM_TYPE";
const SELECTED_PROBLEM_TYPE_MAJOR_METRIC = "SELECTED_PROBLEM_TYPE_MAJOR_METRIC";
const SELECTED_DATASET_LABEL = "SELECTED_DATASET_LABEL";
const SELECTED_DATASET_FILTER = "SELECTED_DATASET_FILTER";
const SELECTED_ML_PLATFORM = "SELECTED_ML_PLATFORM";
const SHOW_DATASET_COLUMN = "SHOW_DATASET_COLUMN";
const SELECTED_METRICS_VISUAL = "SELECTED_METRICS_VISUAL";
const SELECTED_COHORTS_VISUAL = "SELECTED_COHORTS_VISUAL";
const SELECTED_MODELS_VISUAL = "SELECTED_MODELS_VISUAL";
const UPDATE_COMPARE_MODEL_VIEW = "UPDATE_COMPARE_MODEL_VIEW";
const COHORT_SETTINGS_PANEL_STATE = "COHORT_SETTINGS_PANEL_STATE";
const COHORT_CREATE_PANEL_STATE = "COHORT_CREATE_PANEL_STATE";
const COHORT_EDIT_PANEL_STATE = "COHORT_EDIT_PANEL_STATE";
const SELECTED_DATASET_OPERATION = "SELECTED_DATASET_OPERATION";
const UPDATE_COHORT_SETTINGS_LIST = "UPDATE_COHORT_SETTINGS_LIST";
const COHORT_DELETE_DIALOG_STATE = "COHORT_DELETE_DIALOG_STATE";
const COHORT_DUPLICATE_DIALOG_STATE = "COHORT_DUPLICATE_DIALOG_STATE";
const NOTEBOOK_DELETE_DIALOG_STATE = "NOTEBOOK_DELETE_DIALOG_STATE";
const NOTEBOOK_DUPLICATE_DIALOG_STATE = "NOTEBOOK_DUPLICATE_DIALOG_STATE";
const ACTIVE_WIDGET_LIST = "ACTIVE_WIDGET_LIST";
const COLOR_SELECTOR_MODAL_STATE = "COLOR_SELECTOR_MODAL_STATE";
const COMPARATIVE_IMPROVEMENT_COLOR = "COMPARATIVE_IMPROVEMENT_COLOR";
const COMPARATIVE_DECLINE_COLOR = "COMPARATIVE_DECLINE_COLOR";
const USER_COLOR_SELECTION = "USER_COLOR_SELECTION";
const ABSOLUTE_COLOR = "ABSOLUTE_COLOR";
const ABSOLUTE_UPPER_BAND = "ABSOLUTE_UPPER_BAND";
const SET_NOTEBOOK_CLOSER = "SET_NOTEBOOK_CLOSER";
const SET_NOTEBOOK_OPENER = "SET_NOTEBOOK_OPENER";
const SET_RESTORE_NOTEBOOK = "SET_RESTORE_NOTEBOOK";
const NOTEBOOKS_RESTORER = "NOTEBOOKS_RESTORER";
const SET_LEFT_CURRENT_WIDGET = "SET_LEFT_CURRENT_WIDGET";
const SET_MAIN_CURRENT_WIDGET = "SET_MAIN_CURRENT_WIDGET";
const PROJECT_SETTINGS = "PROJECT_SETTINGS"; SET_MAIN_CURRENT_WIDGET

export const setNotebookCloser = (closeNotebook: (path: string[]) => void) => {
    return {
        type: SET_NOTEBOOK_CLOSER,
        closeNotebook,
    };
};
export const setNotebookOpener = (openNotebook: (path: string, oldPath: string) => NotebookPanel) => {
    return {
        type: SET_NOTEBOOK_OPENER,
        openNotebook,
    };
};
export const setRestoreNotebooks = (restoreNotebooks: (widgets: string[], store: Store, showCompareModels: boolean) => string[]) => {
    return {
        type: SET_RESTORE_NOTEBOOK,
        restoreNotebooks,
    };
};
export const setCompareModelsOpener = (openCompareModels: () => void) => {
    return {
        type: SET_COMPARE_MODELS_OPENER,
        openCompareModels,
    };
};
/**
 * 
 * @param workspace 
 * @param project 
 * @returns 
 */
export const createInitialState = (workspace: IWorkspaceType = undefined, project: IProjectType = undefined, problemTypes: any = undefined, mlPlatforms: any = undefined,
    serverUri: string = undefined, resetColorsDefault: boolean = false, heatmapColors: IColorValuesType = undefined): ClientState => {
    return {
        restoreNotebooks: (_: string[], store: Store = undefined, showCompareModels: boolean = false) => <string[]>{}, // default is do nothing
        closeNotebook: (_: string[]) => { }, // default is do nothing
        openNotebook: (_: string) => <NotebookPanel>{}, // default is do nothing
        openCompareModels: () => { }, // default is do nothing
        projectSettings: projectSettingsInitialState(project),
        workspaceSettings: workspaceSettingsInitialState(workspace),
        problemTypes: problemTypes,
        mlPlatforms: mlPlatforms,
        selectedProblemType: selectedProblemTypeInitialState(project),
        selectedProblemTypeMajorMetric: selectedProblemTypeMajorMetricInitialState(project),
        selectedDatasetLabel: undefined,
        selectedMlPlatform: undefined,
        selectedDatasetFilter: undefined,
        selectedDatasetOperation: undefined,
        newNotebook: '', // default is empty
        projectName: workspace?.activeProject,
        projectId: workspace?.activeProjectId,
        projectModalState: false,
        cohortPanelState: false,
        createCohortPanelState: false,
        editCohortPanelState: false,
        inEditCohort: undefined,
        inEditNotebookId: undefined,
        inRegisterNotebookId: undefined,
        modelRegistrationModalState: false,
        editModelRegistrationModalState: false,
        colorSelectorModalState: false,
        cohortDeleteDialogHiddenState: true,
        notebookDialogState: true,
        cohortDuplicateDialogHiddenState: true,
        NotebookDuplicateDialogHiddenState: true,
        projectPropertiesModalState: false,
        compareModelsDatasetState: false,
        selectedMetrics: project?.selectedMetrics,
        selectedCohorts: project?.selectedCohorts,
        selectedModels: project?.selectedModels,
        notebooksRestorer: project?.notebooksRestorer,
        datasets: project?.datasets,
        deleteProjectModalState: true,
        confirmDeleteProjectModalState: true,
        confirmDeleteProjectInfo: {},
        switchProjectModalState: true,
        importNotebookModalState: true,
        serverUri: serverUri,
        filterValuesList: undefined,
        widgetList: [],
        comparativeImprovementColor: [],
        comparativeDeclineColor: [],
        userColorSelections: [],
        absoluteColor: [],
        heatmapColors: heatmapColors,
        resetColorsDefault: resetColorsDefault,
    };
};
export type ProblemTypeState = {
    key: string;
    text: string;
};
/**
 * 
 * @param notebookList 
 * @param newNotebook 
 * @returns 
*/
export const notebookListInitialState = (notebookList: INotebookType[] = undefined, newNotebook: INotebookType = undefined): INotebookType[] => {
    if (!notebookList) {
        notebookList = [];
    }
    if (!newNotebook) {
        let dateTime = new Date();
        let newNotebook = {} as INotebookType;
        let metricsArr: IMetricsType[] = [];
        let notebookMetricsArr: INotebookMetricsType[] = [];
        let notebookMetrics = {} as INotebookMetricsType;
        notebookMetrics.key = "";
        notebookMetrics.name = "";
        notebookMetrics.metricsVisible = true;
        notebookMetrics.mapTo = '';
        notebookMetrics.metrics = metricsArr
        notebookMetricsArr.push(notebookMetrics);
        newNotebook.key = '';
        newNotebook.name = '';
        newNotebook.notebookVisible = false;
        newNotebook.registeredModel = '';
        newNotebook.mlPlatform = '';
        newNotebook.testDataset = '';
        newNotebook.testDatasetKey = '';
        newNotebook.mlFlowRunId = '';
        newNotebook.metrics = notebookMetricsArr;
        newNotebook.dateCreated = dateTime.toLocaleDateString();
        newNotebook.lastUpdated = dateTime.toLocaleDateString();
        notebookList.push(newNotebook);
    }
    else {
        notebookList.push(newNotebook)
    }
    return notebookList;
};
/**
 * 
 * @param project 
 * @returns 
*/
export const selectedProblemTypeMajorMetricInitialState = (project: IProjectType = undefined): any => {
    if (!project) {
        return {
            key: '',
            text: '',
        };
    }
    return {
        key: project.problemTypeMajorMetric,
        text: project.problemTypeMajorMetric,
    };
};
/**
 * 
 * @param project 
 * @returns 
*/
export const selectedProblemTypeInitialState = (project: IProjectType = undefined): any => {
    if (!project) {
        return {
            key: '',
            text: '',
        };
    }
    return {
        key: project.problemTypeKey,
        text: project.problemType,
    };
};
/**
 * 
 * @param workspace 
 * @returns 
*/
export const workspaceSettingsInitialState = (workspace: IWorkspaceType = undefined): IWorkspaceType => {
    if (!workspace) {
        return {
            key: undefined,
            activeProject: undefined,
            activeProjectId: undefined,
            projectList: undefined,
            deleteProjectReferral: undefined,
            dateCreated: undefined,
            lastUpdated: undefined,
        };
    }
    return {
        key: workspace.key,
        activeProject: workspace.activeProject,
        activeProjectId: workspace.activeProjectId,
        projectList: workspace.projectList,
        deleteProjectReferral: workspace.deleteProjectReferral,
        dateCreated: workspace.dateCreated,
        lastUpdated: workspace.lastUpdated,
    };
};
/**
 * 
 * @param project 
 * @returns 
*/
export const projectSettingsInitialState = (project: IProjectType = undefined): IProjectType => {
    if (!project) {
        return {
            key: undefined,
            name: undefined,
            problemType: undefined,
            problemTypeKey: undefined,
            problemTypeMajorMetric: undefined,
            baseNotebookModel: undefined,
            baseNotebookModelKey: undefined,
            enableCompareModelBtn: undefined,
            activeLeftWidgetId: undefined,
            activeMainWidgetId: undefined,
            heatmapColors: undefined,
            notebooks: undefined,
            showCompareModels: undefined,
            toggleVisualDisplay: undefined,
            absoluteVisualDisplay: undefined,
            baselineVisualDisplay: undefined,
            selectedMetrics: undefined,
            selectedCohorts: undefined,
            selectedModels: undefined,
            notebooksRestorer: undefined,
            datasets: undefined,
            cohortsList: undefined,
            dateCreated: undefined,
            lastUpdated: undefined,
            resetColorsDefault: undefined,
        };
    }
    return {
        key: project.key,
        name: project.name,
        problemType: project.problemType,
        problemTypeKey: project.problemTypeKey,
        problemTypeMajorMetric: project.problemTypeMajorMetric,
        baseNotebookModel: project.baseNotebookModel,
        baseNotebookModelKey: project.baseNotebookModelKey,
        enableCompareModelBtn: project.enableCompareModelBtn,
        activeLeftWidgetId: project.activeLeftWidgetId,
        activeMainWidgetId: project.activeMainWidgetId,
        notebooks: project.notebooks,
        heatmapColors: project.heatmapColors,
        showCompareModels: project.showCompareModels,
        toggleVisualDisplay: project.toggleVisualDisplay,
        absoluteVisualDisplay: project.absoluteVisualDisplay,
        baselineVisualDisplay: project.baselineVisualDisplay,
        selectedMetrics: project.selectedMetrics,
        selectedCohorts: project.selectedCohorts,
        selectedModels: project.selectedModels,
        notebooksRestorer: project.notebooksRestorer,
        datasets: project.datasets,
        cohortsList: project.cohortsList,
        dateCreated: project.dateCreated,
        lastUpdated: project.lastUpdated,
        resetColorsDefault: project.resetColorsDefault,
    };
};
export type ClientState = {
    restoreNotebooks: (widgets: string[], store: Store, showCompareModels: boolean) => string[];
    closeNotebook: (paths: string[]) => void;
    openNotebook: (path: string) => NotebookPanel;
    openCompareModels: () => void;
    newNotebook: string;
    projectSettings: IProjectType;
    workspaceSettings: IWorkspaceType;
    problemTypes: any;
    mlPlatforms: any;
    selectedProblemType: any;
    selectedProblemTypeMajorMetric: any;
    selectedDatasetLabel: any;
    selectedDatasetFilter: any;
    selectedDatasetOperation: any;
    selectedMlPlatform: any;
    projectName: string;
    projectId: string;
    projectModalState: boolean;
    deleteProjectModalState: boolean;
    confirmDeleteProjectModalState: boolean;
    confirmDeleteProjectInfo: {};
    cohortPanelState: boolean;
    createCohortPanelState: boolean;
    editCohortPanelState: boolean;
    inEditCohort: IDatasetType;
    inEditNotebookId: number;
    inRegisterNotebookId: number;
    modelRegistrationModalState: boolean;
    editModelRegistrationModalState: boolean;
    cohortDeleteDialogHiddenState: boolean;
    notebookDialogState: boolean;
    cohortDuplicateDialogHiddenState: boolean;
    NotebookDuplicateDialogHiddenState: boolean;
    switchProjectModalState: boolean;
    importNotebookModalState: boolean;
    projectPropertiesModalState: boolean;
    compareModelsDatasetState: boolean;
    selectedMetrics: string[];
    selectedCohorts: string[];
    selectedModels: string[];
    notebooksRestorer: string[];
    datasets: IDatasetType[];
    serverUri: string;
    filterValuesList: any;
    widgetList: any[];
    colorSelectorModalState: boolean;
    comparativeImprovementColor: any[];
    comparativeDeclineColor: any[];
    absoluteColor: any[];
    userColorSelections: any[];
    heatmapColors: IColorValuesType;
    resetColorsDefault: boolean;
};
/**
 * 
 * @param state 
 * @param action 
 * @returns 
*/
export const ClientReducer = (state: ClientState, action: any) => {
    switch (action.type) {
        case SELECTED_PROBLEM_TYPE:
            state.selectedProblemType = action.payload;
            return { ...state };
        case USER_COLOR_SELECTION:
            state.userColorSelections = action.payload;
            return { ...state };
        case COMPARATIVE_IMPROVEMENT_COLOR:
            state.comparativeImprovementColor = action.payload;
            return { ...state };
        case COMPARATIVE_DECLINE_COLOR:
            state.comparativeDeclineColor = action.payload;
            return { ...state };
        case ABSOLUTE_COLOR:
            state.absoluteColor = action.payload;
            return { ...state };
        case SELECTED_PROBLEM_TYPE_MAJOR_METRIC:
            state.selectedProblemTypeMajorMetric = action.payload;
            return { ...state };
        case SELECTED_DATASET_LABEL:
            state.selectedDatasetLabel = action.payload;
            return { ...state };
        case SELECTED_DATASET_FILTER:
            state.selectedDatasetFilter = action.payload;
            return { ...state };
        case SELECTED_DATASET_OPERATION:
            state.selectedDatasetOperation = action.payload;
            return { ...state };
        case SELECTED_ML_PLATFORM:
            const index = state.projectSettings.notebooks.indexOf(action.payload);
            if (index !== -1) {
                state.projectSettings.notebooks[index] = action.payload;
            }
            return { ...state };
        case IN_EDIT_NOTEBOOK_ID: 
            state.inEditNotebookId = action.payload;
            return { ...state };
        case IN_REGISTER_NOTEBOOK_ID: 
            state.inRegisterNotebookId = action.payload;
            return { ...state };
        case SET_RESTORE_NOTEBOOK:
            return { ...state, restoreNotebooks: action.restoreNotebooks };
        case SET_NOTEBOOK_OPENER:
            return { ...state, openNotebook: action.openNotebook };
        case SET_NOTEBOOK_CLOSER:
            return { ...state, closeNotebook: action.closeNotebook };
        case SET_COMPARE_MODELS_OPENER:
            return { ...state, openCompareModels: action.openCompareModels };
        case REFRESH_NOTEBOOK_LIST:
            state.projectSettings.notebooks = action.payload;
            return { ...state };
        case NEW_PROJECT_MODAL_STATE:
            if (state.projectModalState) {
                state.projectModalState = false;
            }
            else {
                state.projectModalState = true;
            }
            return { ...state };
        case DELETE_PROJECT_MODAL_STATE:
            if (state.deleteProjectModalState) {
                state.deleteProjectModalState = false;
            }
            else {
                state.deleteProjectModalState = true;
            }
            return { ...state };
        case CONFIRM_DELETE_PROJECT_MODAL_STATE:
            if (state.confirmDeleteProjectModalState) {
                state.confirmDeleteProjectModalState = false;
            }
            else {
                state.confirmDeleteProjectModalState = true;
            }
            return { ...state };

        case CONFIRM_DELETE_PROJECT_INFO:
            state.confirmDeleteProjectInfo = action.payload;
            return { ...state };
        case COHORT_SETTINGS_PANEL_STATE:
            if (state.cohortPanelState) {
                state.cohortPanelState = false;
            }
            else {
                state.cohortPanelState = true;
            }
            return { ...state };
        case COHORT_CREATE_PANEL_STATE:
            if (state.createCohortPanelState) {
                state.createCohortPanelState = false;
            }
            else {
                state.createCohortPanelState = true;
            }
            return { ...state };
        case COHORT_EDIT_PANEL_STATE:
            if (state.editCohortPanelState) {
                state.editCohortPanelState = false;
            }
            else {
                state.editCohortPanelState = true;
            }
            state.inEditCohort = action.payload;
            return { ...state };
        case SWITCH_PROJECT_MODAL_STATE:
            if (state.switchProjectModalState) {
                state.switchProjectModalState = false;
            }
            else {
                state.switchProjectModalState = true;
            }
            return { ...state };
        case SWITCH_PROJECT_STATE:
            state.workspaceSettings.activeProject = action.payload.name;
            state.workspaceSettings.activeProjectId = action.payload.key;
            state.projectSettings = action.payload;
            return { ...state };
        case MODEL_REGISTRATION_MODAL_STATE:
            if (state.modelRegistrationModalState) {
                state.modelRegistrationModalState = false;
            }
            else {
                state.modelRegistrationModalState = true;
            }
            return { ...state };
        case EDIT_MODEL_REGISTRATION_MODAL_STATE:
            if (state.editModelRegistrationModalState) {
                state.editModelRegistrationModalState = false;
            }
            else {
                state.editModelRegistrationModalState = true;
            }
            return { ...state };
        case COHORT_DELETE_DIALOG_STATE:
            if (state.cohortDeleteDialogHiddenState) {
                state.cohortDeleteDialogHiddenState = false;
            }
            else {
                state.cohortDeleteDialogHiddenState = true;
            }
            return { ...state };
        case NOTEBOOK_DELETE_DIALOG_STATE:
            if (state.notebookDialogState) {
                state.notebookDialogState = false;
            }
            else {
                state.notebookDialogState = true;
            }
            return { ...state };

        case NOTEBOOK_DUPLICATE_DIALOG_STATE:
            if (state.NotebookDuplicateDialogHiddenState) {
                state.NotebookDuplicateDialogHiddenState = false;
            }
            else {
                state.NotebookDuplicateDialogHiddenState = true;
            }
            return { ...state };
        case COHORT_DUPLICATE_DIALOG_STATE:
            if (state.cohortDuplicateDialogHiddenState) {
                state.cohortDuplicateDialogHiddenState = false;
            }
            else {
                state.cohortDuplicateDialogHiddenState = true;
            }
            return { ...state };
        case MODEL_REGISTRATION_STATE:
            state.projectSettings = action.payload;
            return { ...state };
        case IMPORT_NOTEBOOK_MODAL_STATE:
            if (action.payload) {
                state.importNotebookModalState = false;
            }
            else {
                state.importNotebookModalState = true;
            }
            return { ...state };
        case COLOR_SELECTOR_MODAL_STATE:
            if (state.colorSelectorModalState) {
                state.colorSelectorModalState = false;
            }
            else {
                state.colorSelectorModalState = true;
            }
            return { ...state };
        case PROJECT_PROPERTIES_MODAL_STATE:
            if (state.projectPropertiesModalState) {
                state.projectPropertiesModalState = false;
            }
            else {
                state.projectPropertiesModalState = true;
            }
            return { ...state };
        case PROJECT_PROPERTIES_STATE:
            state.projectSettings = action.payload;
            return { ...state };
        case SHOW_DATASET_COLUMN:
            state.compareModelsDatasetState = action.payload;
            return { ...state };
        case SELECTED_METRICS_VISUAL:
            state.selectedMetrics = action.payload;
            return { ...state };
        case SELECTED_COHORTS_VISUAL:
            state.selectedCohorts = action.payload;
            return { ...state };
        case SELECTED_MODELS_VISUAL:
            state.selectedModels = action.payload;
        case NOTEBOOKS_RESTORER:
            state.notebooksRestorer = action.payload;
            return { ...state };
        case UPDATE_COHORT_SETTINGS_LIST:
            state.projectSettings.cohortsList = action.payload;
            return { ...state };
        case UPDATE_COMPARE_MODEL_VIEW:
            state.projectSettings = action.payload;
            return { ...state };
        case FILTER_VALUES_LIST:
            state.filterValuesList = action.payload;
            return { ...state };
        case ACTIVE_WIDGET_LIST:
            state.widgetList = action.payload;
            return { ...state };
        case SET_LEFT_CURRENT_WIDGET:
            state.projectSettings.activeLeftWidgetId = action.payload;
            return { ...state };
        case SET_MAIN_CURRENT_WIDGET:
            state.projectSettings.activeMainWidgetId = action.payload;
            return { ...state };
        case PROJECT_SETTINGS:
            state.projectSettings = action.payload;
            return { ...state };
        default:
            return {
                ...state,
            };
    }
};
