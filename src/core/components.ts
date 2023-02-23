// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { IFilter, ICohortList } from "../app/panels/cohorts/cohortTypes";

/**
 * 
 */
export interface IProjectPair {
    /**
     * A required key to uniquely identify the workspace.
     */
    key: string;
    /**
     * The project name.
     */
    name: string;
}

/**
 * 
 */
export interface IWorkspaceType {
    /**
     * A required key to uniquely identify the workspace.
     */
    key: string;
    /**
     * Workspace active project.
     */
    activeProject: string;
    /**
     *  Workspace active project Id.
     */
    activeProjectId: string;
    /**
     * Workspace projects list.
     */
    projectList: IProjectPair[];
    /**
     * The delete process has finished.
    */
    deleteProjectReferral: boolean;
    /**
     * The date time when the first project was created.
     */
    dateCreated: string;
    /**
     * The last date time the project was updated.
     */
    lastUpdated: string;
}

/**
 * 
 */
export interface IProjectType {
    /**
     * A required key to uniquely identify the project.
     */
    key: string;
    /**
     * A unique project name.
     */
    name: string;
    /**
     *  The project ML problem type.
    */
    problemType: string;
    /**
     *  The project ML problem type.
    */
    problemTypeKey: string;
    /**
     *  The selected ML problem metrics.
    */
    problemTypeMajorMetric: string;
    /**
     *  The project base notebook.
    */
    baseNotebookModel: string;
    /**
     *  The project base notebook Key.
    */
    baseNotebookModelKey: string;
    /**
     * List of the open notebook paths.
    */
    notebooksRestorer: string[];
    /**
     * The left panel last current widget id.
    */
    activeLeftWidgetId: string;
    /**
     * The main panel last current widget id.
    */
    activeMainWidgetId: string;
    /**
     *  Flag that controls enabling the compare models button.
    */
    enableCompareModelBtn: boolean;
    /**
     * The project list of notebooks.
    */
    notebooks: INotebookType[];
    /**
     * The project test data.
    */
    showCompareModels: boolean;
    /**
     * The models comparative visual display.
    */
    toggleVisualDisplay: boolean;
    /**
     * The models absolute visual display.
    */
    absoluteVisualDisplay: boolean;
    /**
     * The models baseline display.
    */
    baselineVisualDisplay: boolean;
    /**
     * Compare Models selected metrics
    */
    selectedMetrics: string[];
    /**
     * Compare Models selected cohorts
    */
    selectedCohorts: string[];
    /**
     * Compare Models selected models
    */
    selectedModels: string[];
    /**
     * The test dataset list.
    */
    datasets: IDatasetType[];
    /**
     * The cohorts list.
    */
    cohortsList: ICohortList[];
    /**
     * User heatmap color selections.
    */
    heatmapColors: IColorValuesType;
    /**
     * Restore heatmap default colors.
    */
    resetColorsDefault: boolean;
    /**
     * The date the project was created.
    */
    dateCreated: string;
    /**
     * The last date time the project was updated.
    */
    lastUpdated: string;
}


export interface IColorValuesType {
    /**
    *
    */
    comparativeDeclineColor: string;
    /**
    *
    */
    comparativeImprovementColor: string;
    /**
    *
    */
    comparativeDefaultDeclineLower: any[];
    /**
    *
    */
    comparativeDefaultDeclineUpper: any[];
    /**
    *
    */
    comparativeDefaultImprovementLower: any[];
    /**
    *
    */
    comparativeDefaultImprovementUpper: any[];
    /**
    *
    */
    absoluteColor: string;
    /**
    *
    */
    absoluteDefaultLower: any[];
    /**
    *
    */
    absoluteDefaultUpper: any[];
}

/**
 * 
 */
export interface INotebookType {
    /**
     * A required key to uniquely identify the notebook.
    */
    key: string;
    /**
     * The notebook name
    */
    name: string;
    /**
     * The notebook local path
    */
    path: string;
    /**
     * Control whether the data is published to the UI.
    */
    notebookVisible: boolean;
    /**
     * mlFlow active Run Id.
    */
    mlFlowRunId: string;
    /**
     * The notebook test data.
    */
    testDataset: string;
    /**
     * The test data unique Id.
     */
    testDatasetKey: string;
    /**
     *  the ML platform used to train the model.
    */
    mlPlatform: string;
    /**
     *  the notebook registered model.
    */
    registeredModel: string;
    /**
     * Selected model accuracy for the left panel grid.t
    */
    modelAccuracy: string;
    /**
     * The notebook metrics.  This object maps closely to the ML problem type.
    */
    metrics: INotebookMetricsType[];
    /**
     * The notebook creation date.
    */
    dateCreated: string;
    /**
     * The last date time the notebook was updated.
    */
    lastUpdated: string;
}

/**
 * 
*/
export interface IDatasetType {
    /**
    * A required key to uniquely identify the dataset/cohort.
    */
    key: string;
    /**
     * The dataset/cohort name.
    */
    name: string;
    /**
     * Indicates if the dataset has a header.
    */
    header: boolean;
    /**
     * The dataset/cohort separator value (tab or comma).
    */
    separator: string;
    /**
     * Indicates if the dataset is a cohort.
    */
    isCohort: boolean;
    /**
     * Indicates if the cohort is in an edit state
    */
    isEditState: boolean;
    /**
    * A required key to uniquely identify the database the cohort was created from. 
    */
    masterKey: string;
    /**
    * the master dataset name.
   */
    masterName: string;
    /**
     *  the ML platform used to train the model.
    */
    mlPlatform: string;
    /**
     *  the notebook registered model.
    */
    registeredModel: string;
    /**
     * mlFlow active Run Id.
    */
    mlFlowRunId: string;
    /**
     * the dataset label index.
    */
    labelIndex: number;
    /**
     * the dataset target.
    */
    label: string;
    /**
     * the list of features.
    */
    features: string[];
    /**
     * the features values.
    */
    featuresValues: IFeatureValuesType[];
    /**
     * the dataset records count.
    */
    recordsCount: number;
    /**
     * the data values as a matrix.
    */
    dataMatrix: number[][];
    /**
     * The list of filters that created the cohort.  List is empty when cohort is all the dataset.
    */
    filterValuesList: IFilter[];
    /**
     * The dataset creation date.
    */
    dateCreated: string;
    /**
     * The last date time the dataset was updated.
    */
    lastUpdated: string;
}

/**
 * 
 */
export interface IFeatureValuesType {
    /**
    * A required key to uniquely identify the feature.
    */
    key: string;
    /**
     * The feature name.
     */
    name: string;
    /**
     * A boolean flag that identifies if the feature is categorical.
     */
    isCategorical: boolean;
    /**
     * the feature values
     */
    values: string[];
}

/**
 * 
*/
export interface INotebookMetricsType {
    /**
     * The dataset or cohort key
     */
    key: string;
    /**
     * The dataset or cohort name.
     */
    name: string;
    /**
     * Control whether the data is published to the UI.
    */
    metricsVisible: boolean;
    /**
     * compare to a specific Cohort, empty for default
    */
    mapTo: string;
    /**
     * The cohort or dataset metrics.  This object maps closely to the ML problem type.
    */
    metrics: IMetricsType[];

}
/**
 * 
*/
export interface IMetricsType {
    /**
     * A required key to uniquely identify the metrics.
    */
    key: string;
    /**
     * The accuracy value.
    */
    value: number;
}
/**
 * 
 */
export interface IUpdatedArtifactsType {
    /**
     * 
    */
    notebook: INotebookType,
    /**
     * 
    */
    notebookList: INotebookType[],
    /**
     * 
    */
    notebooksRestorer: string[];
    /**
     * Compare Models selected models
    */
    selectedModels: string[];
}
/**
 * 
*/
export interface IModelsRegistration {
    /**
     * 
     */
    registeredModel: string;
    /**
     *
     */
    registeredDataset: string;
    /**
     * 
    */
    inEditPlatform: string;
    /**
     * 
    */
    notebookName: string;
    /**
     * 
    */
    mlFlowRunId: string;

}
