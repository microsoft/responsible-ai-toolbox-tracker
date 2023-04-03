// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { UUID } from 'angular2-uuid';
import { DocumentManager } from '@jupyterlab/docmanager';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import {
    URLExt,
    PageConfig,
    PathExt
} from '@jupyterlab/coreutils';
import {
    Contents,
    ServiceManager,
    ServerConnection
} from '@jupyterlab/services';
import {
    IWorkspaceType,
    IProjectType,
    IProjectPair,
    IMetricsType,
    INotebookMetricsType,
    IDatasetType
} from './components';
import { NotebookPanel } from '@jupyterlab/notebook';;
import * as mlConfig from '../configs/mlPlatforms.json';
import * as metricConfig from '../configs/problemTypesMetrics.json'

export class Utils {
    private readonly WORKSPACE_DIR = 'workspace';
    private readonly WORKSPACE_FILE_NAME = 'workspace.json';
    private readonly ARTIFACTS_DIR = 'artifacts';
    private readonly COHORTS_DIR = 'cohorts';
    private workspacePath: string;
    private project_dir: string;
    /**
     * The document manager instance used by the file upload process.
    */
    private docManager: DocumentManager;
    constructor() {
        /**
         * Create a document manager object 
        */
        if (!this.docManager) {
            this.docManager = this.InitializeDocumentManager();

        }
        /**
         * set the workspace file path
        */
        this.workspacePath = PathExt.join(this.WORKSPACE_DIR, this.WORKSPACE_FILE_NAME);
    }
    /**
     * 
     * @param metric 
     * @returns 
    */
    trimDisplayMetric = (metric: number, metricLength: number) => {
        return Number(metric.toFixed(metricLength));
    }
    /**
     * 
     * @param displayStr 
     * @param length 
     * @returns 
    */
    nbNameDisplay = (nbName: string, nbLength: number) => {
        if (nbName?.length < nbLength) { return nbName; }
        let ext = PathExt.extname(nbName);
        let name = PathExt.basename(nbName, ext);
        let displayName = name.substring(0, nbLength);
        displayName = displayName.concat('..', ext);
        return displayName;
    }
    /**
     * 
     * @returns 
    */
    private InitializeDocumentManager(): DocumentManager {
        const manager = new ServiceManager();
        const opener = {
            open: (widget: NotebookPanel) => {
                widget.activate();
            }
        };
        const docRegistry = new DocumentRegistry();
        const docManager = new DocumentManager({
            registry: docRegistry,
            manager,
            opener
        });
        return docManager;
    }
    /**
     * Identify if a string cannot be parse to a numeric value
     * @param str 
     * @returns A boolean flag
    */
    notNumeric(str: string) {
        var numericR = parseFloat(str);
        return isNaN(numericR) || numericR.toString().length != str.length;
    }
    /**
     * Whether a directory exists or not
     *
     * @param dirPath Directory path
     * @returns Directory existence status
    */
    async directoryExists(dirPath: string): Promise<boolean> {
        const content = await this.getContentMetadata(dirPath, 'directory');
        return content?.type === 'directory';
    }
    /**
     * Whether a file exists or not
     *
     * @param filePath File path
     * @returns File existence status
    */
    async fileExists(filePath: string): Promise<boolean> {
        const content = await this.getContentMetadata(filePath);
        return content?.type === 'notebook' || content?.type === 'file';
    }
    /**
     * 
     * @param value 
     * @returns 
    */
    protected primitiveToBoolean = (value: string | number | boolean | null | undefined): boolean => {
        if (typeof value === 'string') {
            return value.toLowerCase() === 'true' || !!+value;
        }
        return !!value;
    }
    /**
     * Remove null and undefined from an array
    */
    protected removeNullEmpty<TValue>(value: TValue | null | undefined): value is TValue {
        return value !== null && value !== undefined;
    }
    protected async _createNewFile(defaultFilePath: string): Promise<Contents.IModel> {
        const type: Contents.ContentType = 'notebook';
        const options: Contents.ICreateOptions = {
            path: defaultFilePath,
            type
        };
        return await this.docManager.services.contents.newUntitled(options);
    }
    async CreateGhostNotebook(filePath: string = undefined): Promise<Contents.IModel> {
        let exists = false;
        await this.fileExists(filePath).then(content => {
            if (content) {
                exists = true
            }
        });
        if (!exists) {
            return await this._createNewFile(this.WORKSPACE_DIR);
        }
        return undefined;
    }
    /**
     * 
     * @param filePath 
     * @returns 
    */
    async GetAllCohorts(datasets: any, projectName: string): Promise<IDatasetType[]> {
        let cohorts: IDatasetType[] = [];
        let cohort = {} as IDatasetType;
        for (let i in datasets) {
            const cohortKey = datasets[i].key;
            const dataObj = await this.GetCohortData(projectName, cohortKey);
            if (!dataObj) { continue; }
            cohort.key = dataObj.key;
            cohort.name = dataObj.name;
            cohort.isCohort = dataObj.isCohort;
            cohort.masterKey = dataObj.masterKey;
            cohort.masterName = dataObj.masterName;
            cohort.labelIndex = dataObj.labelIndex;
            cohort.label = dataObj.label;
            cohort.registeredModel = dataObj.registeredModel;
            cohort.mlPlatform = dataObj.mlPlatform;
            cohort.mlFlowRunId = dataObj.mlFlowRunId;
            cohort.features = dataObj.features;
            cohort.featuresValues = dataObj.featuresValues;
            cohort.header = dataObj.header;
            cohort.separator = dataObj.separator;
            cohort.filterValuesList = dataObj.filterValuesList;
            cohort.dataMatrix = dataObj.dataMatrix;
            cohort.dateCreated = dataObj.dateCreated;
            cohort.lastUpdated = dataObj.lastUpdated;
            cohort.recordsCount = dataObj.recordsCount;
            cohorts.push(cohort);
            cohort = {} as IDatasetType;
        }
        return cohorts;
    }
    /**
     * 
     * @param filePath 
     * @returns 
    */
    async GetCohortData(projectName: string, fileName: string): Promise<IDatasetType> {
        const cohortPath = PathExt.join(this.WORKSPACE_DIR, projectName, this.COHORTS_DIR, fileName, fileName) + '.json';
        await this.fileExists(cohortPath).then(content => {
            if (!content) {
                return null;
            }
        });
        const fileData = await this._readFile(cohortPath);
        return JSON.parse(fileData.content);
    }
    /**
     * 
     * @param datasetEntity 
     * @param projectName 
     * @returns 
    */
    async saveCohortsData(datasetEntity: IDatasetType, projectName: string): Promise<Contents.IModel> {
        if (!datasetEntity) { return null };
        let dirExists = false;
        let cohortPath: string;
        let backupPath: string;
        const cohortsParentDir = PathExt.join(this.WORKSPACE_DIR, projectName, this.COHORTS_DIR);
        const cohortDir = PathExt.join(cohortsParentDir, datasetEntity.key);
        await this.directoryExists(cohortDir).then(content => {
            if (content) {
                dirExists = true;
                cohortPath = PathExt.join(cohortDir, datasetEntity.key) + '.json';
            }
        });
        if (!dirExists) {
            await this._createDirectory(cohortDir);
            cohortPath = PathExt.join(cohortDir, datasetEntity.key) + '.json';
        } else {
            /**
             * create a backup copy to preserve the existing cohort until the process is complete.  
            */
            const backupDir = PathExt.join(cohortsParentDir, 'backup');
            backupPath = PathExt.join(backupDir, datasetEntity.key) + '.json';
            await this.docManager.services.contents.copy(cohortPath, backupPath);
        }
        const cohortContentJson = JSON.stringify(datasetEntity, null, '\t');
        const type: Contents.ContentType = 'file';
        const format: Contents.FileFormat = 'text';
        const model: Partial<Contents.IModel> = {
            type,
            format,
            name: datasetEntity.name,
            content: cohortContentJson
        };
        const cohortContent = await this.docManager.services.contents.save(cohortPath, model);
        if (cohortContent) {
            if (backupPath) {
                await this.deleteFile(backupPath);
            }
        } else {
            // throw new Error(`Failed to save cohort data. ${cohortContentJson}`);
            return undefined;
        }
        return cohortContent;
    }
    /**
     * 
     * @param projectName 
     * @param cohortKey 
    */
    async restoreCohort(projectName: string, cohortKey: string): Promise<void> {
        const cohortsParentDir = PathExt.join(this.WORKSPACE_DIR, projectName, this.COHORTS_DIR);
        const cohortDir = PathExt.join(cohortsParentDir, cohortKey);
        const cohortPath = PathExt.join(cohortDir, cohortKey) + '.json';
        const backupPath = PathExt.join(cohortsParentDir, 'backup', cohortKey) + '.json';
        await this.deleteFile(cohortPath);
        await this.docManager.services.contents.copy(backupPath, cohortPath);
        await this.deleteBackupCohort(backupPath);
    }
    /**
     * 
     * @param cohortDir 
     * @param cohortPath 
     * @returns 
    */
    async deleteBackupCohort(backupCohortPath: string): Promise<void> {
        return await this.docManager.services.contents.delete(backupCohortPath);
    }
    /**
     * 
     * @param projectName 
     * @param cohortKey 
     * @returns 
    */
    async deleteCohort(projectName: string, cohortKey: string): Promise<void> {
        const cohortPath = PathExt.join(this.WORKSPACE_DIR, projectName, this.COHORTS_DIR, cohortKey, cohortKey) + '.json';
        const cohortDir = PathExt.join(this.WORKSPACE_DIR, projectName, this.COHORTS_DIR, cohortKey);
        await this.docManager.services.contents.delete(cohortPath);
        return await this.docManager.services.contents.delete(cohortDir);
    }
    /**
     * 
     * @param filePath 
     * @returns 
    */
    async deleteFile(path: string): Promise<void> {
        await this.docManager.services.contents.delete(path);
    }
    /**
     * 
     * @param path 
     * @returns 
    */
    async deleteResource(path: string): Promise<boolean> {
        try {
            await this.docManager.services.contents.delete(path);
            return true;
        } catch (error) {
            console.log(`Error deleting this file: ${path}.\n${error}`);
            return false;
        }
    }
    /**
     * 
     * @param filePath 
     * @returns 
    */
    async deleteResources(path: string): Promise<boolean> {
        const dirContent = await this.getContentMetadata(path, 'directory');

        if (!(dirContent && dirContent.type === 'directory')) {
            return false;
        }
        let success = false;

        for (const item of dirContent.content) {
            if (item.type === 'directory') {
                success = await this.deleteResources(item.path);

            } else {
                success = await this.deleteResource(item.path);
            }
        }
        success = await this.deleteResource(path);
        return success;
    }
    /**
     * 
     * @param projectName 
     * @param resources 
     * @param notebookPath 
     * @param unregister 
     * @returns 
    */
    async deleteNotebookResources(projectName: string, resources: any[], notebookPath: string = undefined, unregister: boolean = false): Promise<boolean> {
        const mlFlowExpDir = PathExt.join('/mlruns', '0');
        const projectDir = PathExt.join(this.WORKSPACE_DIR, projectName);
        const cohortsDir = PathExt.join(projectDir, this.COHORTS_DIR);
        const artifactsDir = PathExt.join(projectDir, this.ARTIFACTS_DIR);
        for (let res of resources) {
            if (res.delete) {
                switch (res.key) {
                    case "registeredModel":
                        if (res.registeredModel && res.registeredModel.length > 0) {
                            const modelPath = PathExt.join(artifactsDir, res.registeredModel);
                            await this.deleteResource(modelPath);
                        }
                        break;
                    case 'mlFlowRunId':
                        if (unregister) { continue; }
                        const runIdDir = PathExt.join(mlFlowExpDir, res.mlFlowRunId);
                        await this.deleteResources(runIdDir);
                        break;
                    case 'name':
                        if (res.isCohort) {
                            const cohortDir = PathExt.join(cohortsDir, res.cohortId);
                            await this.deleteResources(cohortDir);
                        } else {
                            const cohortPath = PathExt.join(cohortsDir, res.testDatasetKey);
                            await this.deleteResources(cohortPath);
                            const dbPath = PathExt.join(artifactsDir, res.name);
                            await this.deleteResource(dbPath);
                        }
                        break;
                    default:
                        break;
                }
            }
        }
        if (!unregister) { return await this.deleteResource(notebookPath); }
        else { return true; }
    }
    /**
     *  Identify the resources that should be deleted with the notebook.
     * @param notebooks 
     * @param notebookName 
     * @returns 
    */
    async identifyResources(notebooks: any, notebookName: string): Promise<any[]> {
        let resources: any[] = [];
        let resource = {};
        for (let ent of notebooks) {
            if (ent.name === notebookName) {
                resource = {};
                if (ent.registeredModel && ent.registeredModel.length > 0) {
                    resource['key'] = 'registeredModel';
                    resource['registeredModel'] = ent.registeredModel;
                    resource['delete'] = true;
                    resources.push(resource);
                    resource = {};
                }
                resource['key'] = 'mlFlowRunId';
                resource['mlFlowRunId'] = ent.mlFlowRunId;
                resource['delete'] = true;
                resources.push(resource);
                resource = {};
                for (let metrics of ent.metrics) {
                    if (metrics.name && ent.metrics.length > 0) {
                        resource['key'] = 'name';
                        resource['name'] = metrics.name;
                        if (metrics.name === ent.testDataset) {
                            resource['isCohort'] = false;
                        } else {
                            resource['isCohort'] = true;
                        }
                        resource['cohortId'] = metrics.key;
                        resource['testDatasetKey'] = ent.testDatasetKey;
                        resource['delete'] = true;
                        resources.push(resource);
                    }
                    resource = {};
                }
            }
        }
        /**
         * the notebook metrics and registered model.
        */
        for (let notebook of notebooks) {
            if (notebook.name !== notebookName) {
                for (let res of resources) {
                    if (res['key'] === 'registeredModel') {
                        if (res['registeredModel'] === notebook.registeredModel) {
                            res['delete'] = false;
                        }
                    }
                }
                /**
                 * notebook metrics.
                */
                for (let notebookMetrics of notebook.metrics) {
                    for (let res of resources) {
                        if (res['key'] === 'name') {
                            if (res['name'] === notebookMetrics.name) {
                                res['delete'] = false;
                            }
                        }
                    }
                }
            }
        }
        return resources;
    }
    /**
     * Create a json file.
     * @param filePath file path
     * @param content the json content
     * @returns IModel object
    */
    async CreateJsonFile(filePath: string, content: string = ''): Promise<Contents.IModel> {
        // const fileExists = await this.fileExists(filePath);

        this.fileExists(filePath).then(content => {
            if (content) { return; }
        });
        const content_json = JSON.stringify(content, null, '\t');
        return await this._createJsonFile(filePath, content_json);
    }
    /**
     * 
     * @param projectName 
     * @param projectId 
     * @returns 
    */
    async CreateWorkspaceSettingsFile(projectName: string, projectId: string, state: any): Promise<IWorkspaceType> {
        let workspaceContent = {} as IWorkspaceType;
        let dateTime = new Date();
        if (state['workspaceSettings']['key']) {
            workspaceContent.key = state['workspaceSettings']['key'];
            workspaceContent.projectList = state['workspaceSettings']['projectList'];
            workspaceContent.dateCreated = state['workspaceSettings']['dateCreated'];
        }
        else {
            workspaceContent.key = UUID.UUID();
            workspaceContent.projectList = [];
            workspaceContent.dateCreated = dateTime.toLocaleDateString();
        }
        workspaceContent.activeProject = projectName;
        workspaceContent.activeProjectId = projectId;
        workspaceContent.deleteProjectReferral = false;
        state['workspaceSettings']['activeProject'] = workspaceContent.activeProject;
        state['workspaceSettings']['activeProjectId'] = workspaceContent.activeProjectId;
        workspaceContent.lastUpdated = dateTime.toLocaleDateString();
        const projectPair = {} as IProjectPair;
        projectPair.key = projectId;
        projectPair.name = projectName;
        workspaceContent.projectList.push(projectPair);
        const workspaceContentJson = JSON.stringify(workspaceContent, null, '\t');
        const type: Contents.ContentType = 'file';
        const format: Contents.FileFormat = 'text';
        const model: Partial<Contents.IModel> = {
            type,
            format,
            name: 'workspace',
            content: workspaceContentJson
        };
        await this.docManager.services.contents.save(this.workspacePath, model);

        return workspaceContent;
    }
    /**
     * 
     * @param projectSettings 
     * @param baseNotebookModel 
     * @param baseNotebookModelKey 
     * @param toggleVisualDisplay 
     * @param absoluteVisualDisplay 
     * @param baselineVisualDisplay 
     * @param selectedMetrics 
     * @param selectedModels 
     * @param selectedCohorts 
     * @returns 
    */
    async UpdateCompareModelsSettings(projectSettings: any, baseNotebookModel: string = undefined, baseNotebookModelKey: string = undefined, toggleVisualDisplay: boolean = undefined,
        absoluteVisualDisplay: boolean = undefined, baselineVisualDisplay: boolean = undefined, selectedMetrics: string[] = undefined, selectedModels: string[] = undefined, selectedCohorts: string[] = undefined): Promise<Contents.IModel> {
        let projectContent = {} as IProjectType;
        let dateTime = new Date();
        projectContent.name = projectSettings['name'];
        projectContent.key = projectSettings['key'];
        projectContent.problemType = projectSettings['problemType'];
        projectContent.problemTypeKey = projectSettings['problemTypeKey'];
        if (this.setCompareModelsBtn(projectSettings)) {
            projectSettings["enableCompareModelBtn"] = true;
            projectContent.enableCompareModelBtn = true;
        } else {
            projectSettings["enableCompareModelBtn"] = false;
            projectContent.enableCompareModelBtn = false;
        }
        projectContent.showCompareModels = projectSettings['showCompareModels'];
        if (baseNotebookModel && baseNotebookModel !== projectSettings['baseNotebookModel']) {
            projectContent.baseNotebookModel = baseNotebookModel;
            projectSettings['baseNotebookModel'] = baseNotebookModel;
        }
        else {
            projectContent.baseNotebookModel = projectSettings['baseNotebookModel'];
        }
        if (baseNotebookModelKey && baseNotebookModelKey !== projectSettings['baseNotebookModelKey']) {
            projectContent.baseNotebookModelKey = baseNotebookModelKey;
            projectSettings['baseNotebookModelKey'] = baseNotebookModelKey;
        }
        else {
            projectContent.baseNotebookModelKey = projectSettings['baseNotebookModelKey'];
        }
        if (toggleVisualDisplay !== undefined && toggleVisualDisplay !== projectSettings['toggleVisualDisplay']) {
            projectContent.toggleVisualDisplay = toggleVisualDisplay;
            projectSettings['toggleVisualDisplay'] = toggleVisualDisplay;
        }
        else {
            projectContent.toggleVisualDisplay = projectSettings['toggleVisualDisplay'];
        }
        if (absoluteVisualDisplay !== undefined && absoluteVisualDisplay !== projectSettings['absoluteVisualDisplay']) {
            projectContent.absoluteVisualDisplay = absoluteVisualDisplay;
            projectSettings['absoluteVisualDisplay'] = absoluteVisualDisplay;
        }
        else {
            projectContent.absoluteVisualDisplay = projectSettings['absoluteVisualDisplay'];
        }
        if (baselineVisualDisplay !== undefined && baselineVisualDisplay !== projectSettings['baselineVisualDisplay']) {
            projectContent.baselineVisualDisplay = baselineVisualDisplay;
            projectSettings['baselineVisualDisplay'] = baselineVisualDisplay;
        }
        else {
            projectContent.baselineVisualDisplay = projectSettings['baselineVisualDisplay'];
        }
        if (selectedMetrics !== undefined && selectedMetrics !== projectSettings['selectedMetrics']) {
            projectContent.selectedMetrics = selectedMetrics;
            projectSettings['selectedMetrics'] = selectedMetrics;
        }
        else {
            projectContent.selectedMetrics = projectSettings['selectedMetrics'];
        }
        if (selectedCohorts !== undefined && selectedCohorts !== projectSettings['selectedCohorts']) {
            projectContent.selectedCohorts = selectedCohorts;
            projectSettings['selectedCohorts'] = selectedCohorts;
        }
        else {
            projectContent.selectedCohorts = projectSettings['selectedCohorts'];
        }
        if (selectedModels !== undefined && selectedModels !== projectSettings['selectedModels']) {
            projectContent.selectedModels = selectedModels;
            projectSettings['selectedModels'] = selectedModels;
        }
        else {
            projectContent.selectedModels = projectSettings['selectedModels'];
        }
        projectContent.notebooksRestorer = projectSettings["notebooksRestorer"];
        projectContent.resetColorsDefault = projectSettings["resetColorsDefault"];
        projectContent.heatmapColors = projectSettings["heatmapColors"];
        projectContent.activeLeftWidgetId = projectSettings["activeLeftWidgetId"];
        projectContent.activeMainWidgetId = projectSettings["activeMainWidgetId"];
        /**
         * Update notebooks and cohorts visibility.
        */
        projectContent.notebooks = projectSettings['notebooks'];
        for (let i = 0; i < projectContent.notebooks.length; i++) {
            let _item = projectContent.notebooks[i];

            if (projectContent.selectedModels?.indexOf(_item.name) === -1) {
                projectContent.notebooks[i].notebookVisible = false;
            } else {
                projectContent.notebooks[i].notebookVisible = true;
                for (let j in _item.metrics) {
                    let _record = _item.metrics[j];
                    if (projectContent.selectedCohorts?.indexOf(_record.name) === -1) {
                        _record.metricsVisible = false;
                    } else {
                        _record.metricsVisible = true;
                    }
                }
            }
        }
        projectContent.problemTypeMajorMetric = projectSettings['problemTypeMajorMetric'];
        projectContent.datasets = projectSettings['datasets'];
        projectContent.dateCreated = projectSettings['dateCreated'];
        projectContent.lastUpdated = dateTime.toLocaleDateString();
        const projectPath = PathExt.join(this.WORKSPACE_DIR, projectContent.name, projectContent.key) + '.json';
        const projectContentJson = JSON.stringify(projectContent, null, '\t');
        const type: Contents.ContentType = 'file';
        const format: Contents.FileFormat = 'text';
        const model: Partial<Contents.IModel> = {
            type,
            format,
            name: projectContent.name,
            content: projectContentJson
        };
        try {
            return await this.docManager.services.contents.save(projectPath, model);
        } catch (error) {
            return undefined;
        }
    }
    /**
     * Update the baseline model settings
     * @param projectSettings 
     * @param baseNotebookModel 
     * @param baseNotebookModelKey 
     * @returns 
    */
    async UpdateBaselineModel(projectSettings: any, baseNotebookModel: string, baseNotebookModelKey: string): Promise<Contents.IModel> {
        let projectContent = {} as IProjectType;
        let dateTime = new Date();
        projectContent.name = projectSettings['name'];
        projectContent.key = projectSettings['key'];
        projectContent.problemType = projectSettings['problemType'];
        projectContent.problemTypeKey = projectSettings['problemTypeKey'];
        projectContent.baseNotebookModel = baseNotebookModel;
        projectContent.baseNotebookModelKey = baseNotebookModelKey;
        projectSettings['baseNotebookModel'] = baseNotebookModel;
        projectSettings['baseNotebookModelKey'] = baseNotebookModelKey;
        projectContent.notebooksRestorer = projectSettings["notebooksRestorer"];
        if (this.setCompareModelsBtn(projectSettings)) {
            projectSettings["enableCompareModelBtn"] = true;
            projectContent.enableCompareModelBtn = true;
        } else {
            projectSettings["enableCompareModelBtn"] = false;
            projectContent.enableCompareModelBtn = false;
        }
        projectContent.notebooksRestorer = projectSettings["notebooksRestorer"];
        projectContent.showCompareModels = projectSettings['showCompareModels'];
        projectContent.resetColorsDefault = projectSettings["resetColorsDefault"];
        projectContent.heatmapColors = projectSettings["heatmapColors"];
        projectContent.activeLeftWidgetId = projectSettings["activeLeftWidgetId"];
        projectContent.activeMainWidgetId = projectSettings["activeMainWidgetId"];
        projectContent.selectedMetrics = projectSettings['selectedMetrics'];
        projectContent.selectedCohorts = projectSettings['selectedCohorts'];
        projectContent.selectedModels = projectSettings['selectedModels'];
        projectContent.datasets = projectSettings['datasets'];
        projectContent.notebooks = projectSettings['notebooks'];
        projectContent.problemTypeMajorMetric = projectSettings['problemTypeMajorMetric'];
        projectContent.absoluteVisualDisplay = projectSettings['absoluteVisualDisplay'];
        projectContent.baselineVisualDisplay = projectSettings['baselineVisualDisplay'];
        projectContent.toggleVisualDisplay = projectSettings['toggleVisualDisplay'];
        projectContent.dateCreated = projectSettings['dateCreated'];
        projectContent.lastUpdated = dateTime.toLocaleDateString();
        const projectPath = PathExt.join(this.WORKSPACE_DIR, projectContent.name, projectContent.key) + '.json';
        const projectContentJson = JSON.stringify(projectContent, null, '\t');
        const type: Contents.ContentType = 'file';
        const format: Contents.FileFormat = 'text';
        const model: Partial<Contents.IModel> = {
            type,
            format,
            name: projectContent.name,
            content: projectContentJson
        };
        return await this.docManager.services.contents.save(projectPath, model);
    }
    /**
     * 
     * @param projectSettings 
     * @param projectName 
     * @param projectType 
     * @param projectTypeKey 
     * @param majorMetric 
     * @returns 
    */
    async UpdateProjectSettings(projectSettings: any, projectName: string = undefined, projectType: string = undefined, projectTypeKey: string = undefined,
        majorMetric: string = undefined, datasetEntity: IDatasetType[] = undefined, selectedCohorts: string[] = undefined, notebookList: any[] = undefined,
        deleteNotebookName: string = undefined, dupCohort: IDatasetType = undefined, prevCohort: IDatasetType = undefined): Promise<Contents.IModel> {
        let projectContent = {} as IProjectType;
        let dateTime = new Date();
        if (projectName && projectName !== projectSettings['name']) {
            projectContent.name = projectName;
            projectSettings['name'] = projectName;
        }
        else {
            projectContent.name = projectSettings['name'];
        }
        projectContent.key = projectSettings['key'];
        if (projectType && projectType !== projectSettings['problemType']) {
            projectContent.problemType = projectType;
            projectContent.problemTypeKey = projectTypeKey;
            projectSettings['problemType'] = projectType
            projectSettings['problemTypeKey'] = projectTypeKey
        }
        else {
            projectContent.problemType = projectSettings['problemType'];
            projectContent.problemTypeKey = projectSettings['problemTypeKey'];
        }
        if (this.setCompareModelsBtn(projectSettings)) {
            projectSettings["enableCompareModelBtn"] = true;
            projectContent.enableCompareModelBtn = true;
        } else {
            projectSettings["enableCompareModelBtn"] = false;
            projectContent.enableCompareModelBtn = false;
        }
        projectContent.showCompareModels = projectSettings['showCompareModels'];
        projectContent.notebooksRestorer = projectSettings["notebooksRestorer"];
        projectContent.resetColorsDefault = projectSettings["resetColorsDefault"];
        projectContent.heatmapColors = projectSettings["heatmapColors"];
        projectContent.activeLeftWidgetId = projectSettings["activeLeftWidgetId"];
        projectContent.activeMainWidgetId = projectSettings["activeMainWidgetId"];
        if (projectSettings['notebooks']?.length === 0) {
            projectContent.baseNotebookModelKey = "";
            projectContent.baseNotebookModel = "";
        } else if (deleteNotebookName !== undefined && deleteNotebookName === projectSettings['baseNotebookModel']) {
            /**
             * Update the base model.
            */
            let updateBase = false;
            let noMatch = true;
            for (let i = 0; i < projectSettings['notebooks'].length; i++) {
                let notebook = projectSettings['notebooks'][i];
                /**
                 * Check if the base model is registered, otherwise flag it.
                 */
                if (notebook.key === projectSettings['baseNotebookModelKey']) {
                    if (!notebook.registeredModel || notebook.registeredModel.length === 0) {
                        updateBase = true;
                    }
                    noMatch = false;
                }
            }
            if (updateBase || noMatch) {
                for (let i = 0; i < projectSettings['notebooks'].length; i++) {
                    let notebook = projectSettings['notebooks'][i];

                    if (notebook.registeredModel && notebook.registeredModel.length > 0) {
                        projectSettings['baseNotebookModelKey'] = notebook.key;
                        projectSettings['baseNotebookModel'] = notebook.registeredModel;
                        projectContent.baseNotebookModelKey = projectSettings['baseNotebookModelKey'];
                        projectContent.baseNotebookModel = projectSettings['baseNotebookModel'];
                    }
                }
            }

        } else {
            projectContent.baseNotebookModelKey = projectSettings['baseNotebookModelKey'];
            projectContent.baseNotebookModel = projectSettings['baseNotebookModel'];
        }
        if (notebookList !== undefined && notebookList !== projectSettings['notebookList']) {
            projectContent.notebooks = notebookList;
            projectSettings['notebooks'] = notebookList;
        }
        else {
            projectContent.notebooks = projectSettings['notebooks'];
            if (prevCohort) {
                for (let i = 0; i < projectContent.notebooks.length; i++) {
                    let notebook = projectContent.notebooks[i];
                    for (let j in notebook.metrics) {
                        if (notebook.metrics[j].key === prevCohort?.key) {
                            let notebookMetrics = {} as INotebookMetricsType;
                            notebookMetrics.key = dupCohort.key;
                            notebookMetrics.name = dupCohort.name;
                            notebookMetrics.metricsVisible = true;
                            notebookMetrics.mapTo = '';
                            notebookMetrics.metrics = notebook.metrics[j].metrics;
                            notebook.metrics.push(notebookMetrics);
                        }
                    }

                    projectContent.notebooks[i] = notebook;
                }
                projectSettings['notebooks'] = projectContent.notebooks;
            }
        }
        projectContent.selectedMetrics = projectSettings['selectedMetrics'];
        if (selectedCohorts !== undefined && selectedCohorts !== projectSettings['selectedCohorts']) {
            projectContent.selectedCohorts = selectedCohorts;
            projectSettings['selectedCohorts'] = selectedCohorts;
        }
        else {
            projectContent.selectedCohorts = projectSettings['selectedCohorts'];
        }
        projectContent.selectedModels = projectSettings['selectedModels'];
        if (datasetEntity !== undefined && datasetEntity !== projectSettings['datasets']) {
            projectContent.datasets = datasetEntity;
            projectSettings['datasets'] = datasetEntity;
        }
        else {
            projectContent.datasets = projectSettings['datasets'];
        }
        if (majorMetric && majorMetric !== projectSettings['problemTypeMajorMetric']) {
            projectContent.problemTypeMajorMetric = majorMetric;
            projectSettings['problemTypeMajorMetric'] = majorMetric;
        }
        else {
            projectContent.problemTypeMajorMetric = projectSettings['problemTypeMajorMetric'];
        }
        projectContent.toggleVisualDisplay = projectSettings['toggleVisualDisplay'];
        projectContent.absoluteVisualDisplay = projectSettings['absoluteVisualDisplay'];
        projectContent.baselineVisualDisplay = projectSettings['baselineVisualDisplay'];
        projectContent.dateCreated = projectSettings['dateCreated'];
        projectContent.lastUpdated = dateTime.toLocaleDateString();
        const projectPath = PathExt.join(this.WORKSPACE_DIR, projectContent.name, projectContent.key) + '.json';
        const projectContentJson = JSON.stringify(projectContent, null, '\t');
        const type: Contents.ContentType = 'file';
        const format: Contents.FileFormat = 'text';
        const model: Partial<Contents.IModel> = {
            type,
            format,
            name: projectContent.name,
            content: projectContentJson
        };
        return await this.docManager.services.contents.save(projectPath, model);
    }
    /**
     * Update base project settings.
    */
    async UpdateBaseProjectSettings(projectSettings: any): Promise<Contents.IModel> {
        let projectContent = {} as IProjectType;
        let dateTime = new Date();
        projectContent.name = projectSettings['name'];
        projectContent.key = projectSettings['key'];
        projectContent.problemType = projectSettings['problemType'];
        projectContent.problemTypeKey = projectSettings['problemTypeKey'];
        projectContent.baseNotebookModelKey = projectSettings['baseNotebookModelKey'];
        projectContent.baseNotebookModel = projectSettings['baseNotebookModel'];
        projectContent.notebooksRestorer = projectSettings["notebooksRestorer"];
        projectContent.activeLeftWidgetId = projectSettings["activeLeftWidgetId"];
        projectContent.activeMainWidgetId = projectSettings["activeMainWidgetId"];
        if (this.setCompareModelsBtn(projectSettings)) {
            projectSettings["enableCompareModelBtn"] = true;
            projectContent.enableCompareModelBtn = true;
        } else {
            projectSettings["enableCompareModelBtn"] = false;
            projectContent.enableCompareModelBtn = false;
        }
        projectContent.showCompareModels = projectSettings['showCompareModels'];
        projectContent.resetColorsDefault = projectSettings["resetColorsDefault"];
        projectContent.heatmapColors = projectSettings["heatmapColors"];
        projectContent.selectedMetrics = projectSettings['selectedMetrics'];
        projectContent.selectedCohorts = projectSettings['selectedCohorts'];
        projectContent.selectedModels = projectSettings['selectedModels'];
        projectContent.problemTypeMajorMetric = projectSettings['problemTypeMajorMetric'];
        projectContent.toggleVisualDisplay = projectSettings['toggleVisualDisplay'];
        projectContent.absoluteVisualDisplay = projectSettings['absoluteVisualDisplay'];
        projectContent.baselineVisualDisplay = projectSettings['baselineVisualDisplay'];
        projectContent.datasets = projectSettings['datasets'];
        projectContent.notebooks = projectSettings['notebooks'];
        projectContent.dateCreated = projectSettings['dateCreated'];
        projectContent.lastUpdated = dateTime.toLocaleDateString();
        const projectPath = PathExt.join(this.WORKSPACE_DIR, projectContent.name, projectContent.key) + '.json';
        const projectContentJson = JSON.stringify(projectContent, null, '\t');
        const type: Contents.ContentType = 'file';
        const format: Contents.FileFormat = 'text';
        const model: Partial<Contents.IModel> = {
            type,
            format,
            name: projectContent.name,
            content: projectContentJson
        };
        return await this.docManager.services.contents.save(projectPath, model);
    }
    /**
     * 
     * @param metricKey 
     * @returns 
     */
    cleanMetricKeys = (metricKey: string) => {
        switch (metricKey) {
            case 'accuracy':
                return 'Accuracy';
            case 'f1':
                return 'F1 Score';
            case 'log_loss':
                return 'Log Loss';
            case 'precision':
                return 'Precision';
            case 'recall':
                return 'Recall';
            case 'accuracy':
                return 'Accuracy';
            case 'roc_auc':
                return 'ROC AUC';
            case 'mae':
                return 'mae';
            case 'mse':
                return 'mse';
            case 'r2':
                return 'r2';
            case 'rmse':
                return 'rmse';
            default:
                return 'Result';
        }
    };
    /**
     * Unregister a model and update project settings
     * @param projectSettings 
     * @param notebookKey 
     * @param notebookName 
     * @returns 
    */
    async UnregisterModelSettings(projectSettings: any, notebookKey: string, notebookName: string): Promise<Contents.IModel> {
        let projectContent = {} as IProjectType;
        let dateTime = new Date();

        projectContent.key = projectSettings['key'];
        projectContent.name = projectSettings['name'];
        projectContent.problemType = projectSettings['problemType'];
        projectContent.problemTypeKey = projectSettings['problemTypeKey'];
        projectContent.problemTypeMajorMetric = projectSettings['problemTypeMajorMetric'];
        projectContent.selectedMetrics = projectSettings['selectedMetrics'];
        projectContent.selectedCohorts = projectSettings['selectedCohorts'];
        projectContent.selectedModels = projectSettings['selectedModels'];
        projectContent.datasets = projectSettings['datasets'];
        if (this.setCompareModelsBtn(projectSettings)) {
            projectSettings["enableCompareModelBtn"] = true;
            projectContent.enableCompareModelBtn = true;
        } else {
            projectSettings["enableCompareModelBtn"] = false;
            projectContent.enableCompareModelBtn = false;
        }
        projectContent.showCompareModels = projectSettings['showCompareModels'];
        projectContent.notebooks = projectSettings['notebooks'];
        projectContent.toggleVisualDisplay = projectSettings['toggleVisualDisplay'];
        projectContent.absoluteVisualDisplay = projectSettings['absoluteVisualDisplay'];
        projectContent.baselineVisualDisplay = projectSettings['baselineVisualDisplay'];
        projectContent.baseNotebookModelKey = projectSettings['baseNotebookModelKey'];
        projectContent.baseNotebookModel = projectSettings['baseNotebookModel'];
        projectContent.dateCreated = projectSettings['dateCreated'];
        projectContent.lastUpdated = dateTime.toLocaleDateString();
        const projectPath = PathExt.join(this.WORKSPACE_DIR, projectContent.name, projectContent.key) + '.json';
        for (let i = 0; i < projectContent.notebooks.length; i++) {
            let notebook = projectContent.notebooks[i];
            /**
             * unregister the  notebook model
             */
            if (notebook.key === notebookKey) {
                notebook.registeredModel = '';
                notebook.mlPlatform = '';
                notebook.testDataset = '';
                notebook.testDatasetKey = '';
                notebook.metrics = [];
            }

            projectContent.notebooks[i] = notebook;
        }
        const projectContentJson = JSON.stringify(projectContent, null, '\t');
        const type: Contents.ContentType = 'file';
        const format: Contents.FileFormat = 'text';
        const model: Partial<Contents.IModel> = {
            type,
            format,
            name: projectContent.name,
            content: projectContentJson
        };
        return await this.docManager.services.contents.save(projectPath, model);
    }
    /**
     * 
     * @param projectSettings 
     * @param transformedCohort 
     * @param metrics 
     * @param datasets 
     * @param selectedCohorts 
     * @returns 
    */
    async saveCohortModelSettings(projectSettings: any, transformedCohort: any, metrics: any, datasets: IDatasetType[] = undefined,
        selectedCohorts: string[] = undefined): Promise<Contents.IModel> {
        let projectContent = {} as IProjectType;
        let dateTime = new Date();

        projectContent.key = projectSettings['key'];
        projectContent.name = projectSettings['name'];
        projectContent.problemType = projectSettings['problemType'];
        projectContent.problemTypeKey = projectSettings['problemTypeKey'];
        projectContent.problemTypeMajorMetric = projectSettings['problemTypeMajorMetric'];
        projectContent.baseNotebookModelKey = projectSettings['baseNotebookModelKey'];
        projectContent.baseNotebookModel = projectSettings['baseNotebookModel'];
        projectContent.selectedMetrics = projectSettings['selectedMetrics'];
        if (selectedCohorts !== undefined && selectedCohorts !== projectSettings['selectedCohorts']) {
            projectContent.selectedCohorts = selectedCohorts;
            projectSettings['selectedCohorts'] = selectedCohorts;
        }
        else {
            projectContent.selectedCohorts = projectSettings['selectedCohorts'];
        }

        projectContent.selectedModels = projectSettings['selectedModels'];

        if (datasets !== undefined && datasets !== projectSettings['datasets']) {
            projectContent.datasets = datasets;
            projectSettings['datasets'] = datasets;
        }
        else {
            projectContent.datasets = projectSettings['datasets'];
        }

        if (this.setCompareModelsBtn(projectSettings)) {
            projectSettings["enableCompareModelBtn"] = true;
            projectContent.enableCompareModelBtn = true;
        } else {
            projectSettings["enableCompareModelBtn"] = false;
            projectContent.enableCompareModelBtn = false;
        }
        projectContent.showCompareModels = projectSettings['showCompareModels'];
        projectContent.notebooksRestorer = projectSettings["notebooksRestorer"];
        projectContent.resetColorsDefault = projectSettings["resetColorsDefault"];
        projectContent.heatmapColors = projectSettings["heatmapColors"];
        projectContent.activeLeftWidgetId = projectSettings["activeLeftWidgetId"];
        projectContent.activeMainWidgetId = projectSettings["activeMainWidgetId"];
        projectContent.notebooks = projectSettings['notebooks'];
        projectContent.toggleVisualDisplay = projectSettings['toggleVisualDisplay'];
        projectContent.absoluteVisualDisplay = projectSettings['absoluteVisualDisplay'];
        projectContent.baselineVisualDisplay = projectSettings['baselineVisualDisplay'];
        projectContent.dateCreated = projectSettings['dateCreated'];
        projectContent.lastUpdated = dateTime.toLocaleDateString();
        let metricsArr: IMetricsType[] = [];
        let notebookMetricsArr: INotebookMetricsType[] = [];
        let notebookMetrics = {} as INotebookMetricsType;
        for (let i = 0; i < projectContent.notebooks.length; i++) {
            let notebook = projectContent.notebooks[i];
            /**
             * If the cohort master dataset is the same as the notebook test dataset, 
             * then the cohort metrics  map to the notebook.
            */
            if (notebook.testDatasetKey === transformedCohort.masterKey && notebook.registeredModel !== undefined && notebook.registeredModel !== '') {
                /**
                 * Get the current list of metrics objects.
                */
                notebook.metrics.forEach(obj => notebookMetricsArr.push(Object.assign({}, obj)));

                notebookMetrics.key = transformedCohort.key;
                notebookMetrics.name = transformedCohort.name;
                notebookMetrics.metricsVisible = true;
                /**
                 * New cohorts will be mapped to its counterpart in the baseline model.
                 */
                notebookMetrics.mapTo = transformedCohort.name;
                let _metrics = {} as IMetricsType;
                for (let k in metrics) {
                    if (notebook.name === metrics[k].notebookName && notebook.testDataset === metrics[k].dataset) {
                        /**
                         *  remove existing record before adding a new one. Cover the save and edits.
                        */
                        for (let m in notebookMetricsArr) {
                            let ent = notebookMetricsArr[m];
                            if (ent.key === transformedCohort.key) {
                                notebookMetricsArr?.splice(Number(m), 1);
                            }
                        }
                        /**
                         * Add new metrics.
                        */
                        for (let j in metrics[k].metrics) {
                            let v = metrics[k].metrics[j];
                            _metrics.key = this.cleanMetricKeys(j);
                            _metrics.value = v;
                            metricsArr.push(_metrics);
                            _metrics = {} as IMetricsType;
                        }
                    }
                }
                notebookMetrics.metrics = metricsArr;
                notebookMetricsArr.push(notebookMetrics);
                notebook.metrics = notebookMetricsArr;
                metricsArr = [];
                notebookMetrics = {} as INotebookMetricsType;
                notebookMetricsArr = [];
            }
            projectContent.notebooks[i] = notebook;
        }
        const projectContentJson = JSON.stringify(projectContent, null, '\t');
        const type: Contents.ContentType = 'file';
        const format: Contents.FileFormat = 'text';
        const model: Partial<Contents.IModel> = {
            type,
            format,
            name: projectContent.name,
            content: projectContentJson
        };
        const projectPath = PathExt.join(this.WORKSPACE_DIR, projectContent.name, projectContent.key) + '.json';
        return await this.docManager.services.contents.save(projectPath, model);
    }
    /**
     * 
     * @param projectSettings 
     * @param threshold 
     * @returns 
    */
    setCompareModelsBtn(projectSettings: any, threshold: number = 0): boolean {
        let count = 0;
        for (let i = 0; i < projectSettings['notebooks'].length; i++) {
            let notebook = projectSettings['notebooks'][i];
            if (notebook.registeredModel && notebook.registeredModel.length > 0) {
                count++;
            }
        }
        if (count > threshold) {
            return true;
        } else {
            return false;
        }
    }
    /**
     * 
     * @param projectSettings 
     * @param notebookName 
     * @param registeredModel 
     * @returns 
    */
    async SaveRegisteredModelSettings(projectSettings: any, notebookName: string = undefined, registeredModel: string = undefined,
        dataset: string = undefined, metricsList: any = undefined, mlPlatformSelected: string = undefined, datasetEntity: IDatasetType = undefined,
        addDataset: boolean, selectedModels: string[] = undefined, header: boolean = undefined, separator: string = undefined): Promise<Contents.IModel> {

        let projectContent = {} as IProjectType;
        let dateTime = new Date();
        let db = {} as IDatasetType;
        projectContent.key = projectSettings['key'];
        projectContent.name = projectSettings['name'];
        projectContent.problemType = projectSettings['problemType'];
        projectContent.problemTypeKey = projectSettings['problemTypeKey'];
        projectContent.problemTypeMajorMetric = projectSettings['problemTypeMajorMetric'];
        projectContent.notebooksRestorer = projectSettings["notebooksRestorer"];
        projectContent.resetColorsDefault = projectSettings["resetColorsDefault"];
        projectContent.heatmapColors = projectSettings["heatmapColors"];
        projectContent.activeLeftWidgetId = projectSettings["activeLeftWidgetId"];
        projectContent.activeMainWidgetId = projectSettings["activeMainWidgetId"];
        /**
         * Update the base model to cove for unregister, delete, etc.
        */
        let updateBase = false;
        let noMatch = true;
        for (let i = 0; i < projectSettings['notebooks'].length; i++) {
            let notebook = projectSettings['notebooks'][i];
            /**
             * Check if the base model is registered, otherwise flag it.
             */
            if (notebook.key === projectSettings['baseNotebookModelKey']) {
                if (!notebook.registeredModel || notebook.registeredModel.length === 0) {
                    updateBase = true;
                }
                noMatch = false;
            }
        }
        if (updateBase || noMatch) {
            for (let i = 0; i < projectSettings['notebooks'].length; i++) {
                let notebook = projectSettings['notebooks'][i];

                if (notebook.registeredModel && notebook.registeredModel.length > 0) {
                    projectSettings['baseNotebookModelKey'] = notebook.key;
                    projectSettings['baseNotebookModel'] = notebook.registeredModel;
                    projectContent.baseNotebookModelKey = projectSettings['baseNotebookModelKey'];
                    projectContent.baseNotebookModel = projectSettings['baseNotebookModel'];
                }
            }
        } else {
            projectContent.baseNotebookModel = registeredModel;
        }
        /**
         * threshold for model comparison is one registered model.
        */
        if (this.setCompareModelsBtn(projectSettings, -1)) {
            projectSettings["enableCompareModelBtn"] = true;
            projectContent.enableCompareModelBtn = true;
        } else {
            projectSettings["enableCompareModelBtn"] = false;
            projectContent.enableCompareModelBtn = false;
        }
        projectContent.showCompareModels = projectSettings['showCompareModels'];
        projectContent.selectedMetrics = projectSettings['selectedMetrics'];
        projectContent.selectedCohorts = projectSettings['selectedCohorts'];

        if (selectedModels !== undefined && selectedModels.indexOf(notebookName) === -1) {
            selectedModels.push(notebookName);
            projectContent.selectedModels = selectedModels;
            projectSettings['selectedModels'] = selectedModels;
        }
        else {
            projectContent.selectedModels = projectSettings['selectedModels'];
        }
        if (addDataset && datasetEntity) {
            db.key = datasetEntity.key;
            db.name = datasetEntity.name;
            db.masterKey = datasetEntity.masterKey;
            db.masterName = datasetEntity.masterName;
            db.labelIndex = datasetEntity.labelIndex;
            db.label = datasetEntity.label;
            db.features = datasetEntity.features;
            db.isCohort = datasetEntity.isCohort;
            db.separator = separator;
            db.header = header;
            db.filterValuesList = datasetEntity.filterValuesList;
            projectSettings['datasets'].push(db);
            projectContent.datasets = projectSettings['datasets'];
            projectSettings['selectedCohorts'].push(datasetEntity.name);
            projectContent.selectedCohorts = projectSettings['selectedCohorts'];
        }
        else {
            projectContent.datasets = projectSettings['datasets'];
        }
        if (!projectSettings['selectedMetrics'] || projectSettings['selectedMetrics'].length === 0) {
            let _selectedMetrics = [];
            let metrics = [];
            if (metricsList && metricsList.length > 0) {
                metrics = metricsList[0]['metrics'];
            }
            for (let k in metrics) {
                _selectedMetrics.push(this.cleanMetricKeys(k));
            }
            projectSettings['selectedMetrics'] = _selectedMetrics;
            projectContent.selectedMetrics = projectSettings['selectedMetrics'];
        }
        projectContent.notebooks = projectSettings['notebooks'];
        projectContent.toggleVisualDisplay = projectSettings['toggleVisualDisplay'];
        projectContent.absoluteVisualDisplay = projectSettings['absoluteVisualDisplay'];
        projectContent.baselineVisualDisplay = projectSettings['baselineVisualDisplay'];
        projectContent.dateCreated = projectSettings['dateCreated'];
        projectContent.lastUpdated = dateTime.toLocaleDateString();
        const projectPath = PathExt.join(this.WORKSPACE_DIR, projectContent.name, projectContent.key) + '.json';
        /**
         * First process the user model registration request.
        */
        for (let i = 0; i < projectContent.notebooks.length; i++) {
            let notebook = projectContent.notebooks[i];

            if (notebook.name === notebookName) {
                if (registeredModel) {
                    notebook.registeredModel = registeredModel;
                    notebook.mlPlatform = mlPlatformSelected;
                    notebook.testDataset = dataset;
                    notebook.notebookVisible = true;
                    notebook.testDatasetKey = datasetEntity.key;
                    if (updateBase || noMatch) {
                        projectContent.baseNotebookModelKey = notebook.key;
                        projectContent.baseNotebookModel = registeredModel;
                    }
                }
                if (metricsList && metricsList.length > 0) {
                    let metricsArr: IMetricsType[] = [];
                    let notebookMetricsArr: INotebookMetricsType[] = [];
                    let notebookMetrics = {} as INotebookMetricsType;
                    for (let ent of metricsList) {
                        if (ent.notebookName === notebook.name && ent.masterDataset === notebook.testDataset) {
                            notebookMetrics.key = ent.datasetKey;
                            if (ent.cohortName && ent.cohortName.length > 0) {
                                notebookMetrics.name = ent.cohortName;
                            } else {
                                notebookMetrics.name = ent.dataset;
                            }
                            if (projectContent.selectedCohorts.includes(notebookMetrics.name)) {
                                notebookMetrics.metricsVisible = true;
                            } else {
                                notebookMetrics.metricsVisible = false;
                            }
                            notebookMetrics.mapTo = '';

                            let _metrics = {} as IMetricsType;
                            for (let k in ent.metrics) {
                                let v = ent.metrics[k];
                                _metrics.key = this.cleanMetricKeys(k);
                                _metrics.value = v;
                                metricsArr.push(_metrics);
                                _metrics = {} as IMetricsType;
                            }
                            notebookMetrics.metrics = metricsArr;
                            notebookMetricsArr.push(notebookMetrics);
                            metricsArr = [];
                            notebookMetrics = {} as INotebookMetricsType;
                        }
                    }
                    notebook.metrics = notebookMetricsArr;
                }
                projectContent.notebooks[i] = notebook;
            }
        }
        const projectContentJson = JSON.stringify(projectContent, null, '\t');
        const type: Contents.ContentType = 'file';
        const format: Contents.FileFormat = 'text';
        const model: Partial<Contents.IModel> = {
            type,
            format,
            name: projectContent.name,
            content: projectContentJson
        };
        return await this.docManager.services.contents.save(projectPath, model);
    }
    /**
     * 
     * @param dataContent 
     * @param filePath 
     * @returns 
    */
    async SaveContent(dataContent: any, filePath: string): Promise<Contents.IModel> {
        const content = JSON.stringify(dataContent, null, '\t');
        const type: Contents.ContentType = 'file';
        const format: Contents.FileFormat = 'text';
        const model: Partial<Contents.IModel> = {
            type,
            format,
            name: dataContent['key'],
            content
        };
        return await this.docManager.services.contents.save(filePath, model);
    }
    /**
     * Create the project settings file.
     * @param project project object of type projectType
     * @returns IModel object
    */
    async CreateProjectSettingsFile(project: IProjectType): Promise<Contents.IModel> {
        const projectPath = PathExt.join(this.WORKSPACE_DIR, project.name, project.key) + '.json';
        if (project.notebooks && project.notebooks.length === 1) {
            const notebookPath = PathExt.join(this.WORKSPACE_DIR, project.name, this.ARTIFACTS_DIR, project.notebooks[0].name) + '.ipynb';
            project.notebooks[0].path = notebookPath;
        }
        await this.fileExists(projectPath).then(content => {
            if (content) {
                return;
            }
        });
        const contentJson = JSON.stringify(project, null, '\t');
        return await this._createJsonFile(projectPath, contentJson);
    }
    /**
     * create a json file.
     * @param filePath the file path
     * @param data the json content
     * @returns IModel object
    */
    async _createJsonFile(filePath: string, data: string = '{}'): Promise<Contents.IModel> {
        const type: Contents.ContentType = 'file';
        const format: Contents.FileFormat = 'text';
        const model: Partial<Contents.IModel> = {
            type,
            format,
            name: filePath,
            content: data
        };
        return await this.docManager.services.contents.save(filePath, model);
    }
    /**
     * Get the workspace settings   
     * @param content the jason content
     * @returns  workspace settings object
    */
    async GetWorkspaceSettings(): Promise<IWorkspaceType> {
        await this.fileExists(this.workspacePath).then(content => {
            if (!content) {
                return null;
            }
        });
        const fileData = await this._readFile(this.workspacePath);
        if (fileData) {
            return JSON.parse(fileData.content);
        } else {
            return undefined;
        }
    }
    /**
     * Get the project setting data
     * @param projectId 
     * @returns Project type object
    */
    async GetProjectSettings(projectName: string = undefined, projectKey: string = undefined): Promise<IProjectType> {
        const file_path = PathExt.join(this.WORKSPACE_DIR, projectName, projectKey) + '.json';
        await this.fileExists(file_path).then(content => {
            if (content) {
                return null;
            }
        });
        const fileData = await this._readFile(file_path);
        return JSON.parse(fileData.content);
    }
    /**
     * 
     * @returns 
    */
    async GetMlPlatforms(): Promise<any> {
        return mlConfig;
    }
    /**
     * 
     * @returns 
     */
    async GetProblemTypes(): Promise<any> {
        return metricConfig;
    }
    /**
     * Read a file 
     * @param filePath the file path
     * @returns IModel object
    */
    async _readFile(filePath: string): Promise<Contents.IModel> {
        return await this.docManager.services.contents.get(filePath);
    }
    /**
     * Create the workspace dir
     * @returns True of false
    */
    async CreateWorkspaceFolder(): Promise<Contents.IModel> {
        await this._createDirectory(this.WORKSPACE_DIR);
        const workspaceContentJson = '{}'
        const type: Contents.ContentType = 'file';
        const format: Contents.FileFormat = 'text';
        const model: Partial<Contents.IModel> = {
            type,
            format,
            name: 'workspace',
            content: workspaceContentJson
        };
        return await this.docManager.services.contents.save(this.workspacePath, model);
    }
    /**
     * Create the project folder 
     *
     * @param dirName the new directory name a.ka. project id
    */
    async CreateProjectFolder(projectDir: string): Promise<boolean> {
        this.project_dir = PathExt.join(this.WORKSPACE_DIR, projectDir);
        await this._createDirectory(this.project_dir);
        return await this.createEntityFolders();
    }
    /**
     * Create the artifacts/cohorts dirs.
     * @returns True of false
    */
    async createEntityFolders(): Promise<boolean> {
        const artifactsPath = PathExt.join(this.project_dir, this.ARTIFACTS_DIR);
        const cohortsPath = PathExt.join(this.project_dir, this.COHORTS_DIR);
        const cohortBackupPath = PathExt.join(cohortsPath, 'backup');
        await this._createDirectory(artifactsPath);
        await this._createDirectory(cohortsPath);
        return await this._createDirectory(cohortBackupPath);
    }
    /**
     * function to create a directory
     * @param dirPath the directory path
     * @returns boolean
    */
    async _createDirectory(dirPath: string): Promise<boolean> {

        await this.directoryExists(dirPath).then(result => {
            if (result) { return true; }
        });

        const body = JSON.stringify({
            format: 'json',
            type: 'directory'
        });

        let response = null;

        try {
            response = await this._fetch(dirPath, {
                method: 'PUT',
                body
            });
        } catch (error) {
            // do nothing
        }
        return response?.status === 201;
    }
    /**
     * 
    */
    async resetWorkspaceSettings(): Promise<void> {
        const workspaceContentJson = '{}';
        const type: Contents.ContentType = 'file';
        const format: Contents.FileFormat = 'text';
        const model: Partial<Contents.IModel> = {
            type,
            format,
            name: 'workspace',
            content: workspaceContentJson
        };
        await this.docManager.services.contents.save(this.workspacePath, model);
    }
    /**
    * Check whether a name is a valid file or folder name.
    * Disallows names with zero length, and "/", and "\", and ":" in file names.
    * @param name 
    * @returns 
   */
    isValidName(name: string): boolean {
        if (!name) { return false; }
        const validNameExp = /[\/\\\<\>\?:]/;
        if (!name.replace(/\s/g, '').length) {
            return false;
        }
        return name.length > 0 && name.length < 101 && !validNameExp.test(name);
    }
    /**
     * 
     * @param file_path the file path
     * @param request the request object
     * @returns a response object or null
    */
    private async delete(
        filePath: string
    ): Promise<boolean> {
        const settings: ServerConnection.ISettings = ServerConnection.makeSettings();
        const baseUrl = this.GetBaseUrl();
        const apiUrl = 'api/contents';
        const url = URLExt.join(baseUrl, apiUrl, filePath);
        const init = { method: 'DELETE' };
        const response = await ServerConnection.makeRequest(url, init, settings);

        if (response.status !== 204) {
            const err = await ServerConnection.ResponseError.create(response);
            console.log(err.message);
            return false;
        } else {
            return true;
        }
    }
    async deleteCheckpoint(
        filePath: string,
    ): Promise<boolean> {
        const settings: ServerConnection.ISettings = ServerConnection.makeSettings();
        const checkpointID = '.ipynb_checkpoints';
        let args: string[] = [filePath, checkpointID];

        const parts = args.map(path => URLExt.encodeParts(path));
        const baseUrl = this.GetBaseUrl();
        const apiUrl = 'api/contents';
        const init = { method: 'DELETE' };
        let url = URLExt.join(baseUrl, apiUrl, ...parts);
        const response = await ServerConnection.makeRequest(
            url,
            init,
            settings
        );
        if (response.status !== 204) {
            const err = await ServerConnection.ResponseError.create(response);
            return false;
        }
        return true;
    }
    /**
     * Delete a file
     *
     * @param filePath File path
    * @returns Success status
    */
    async deleteProjectFile(filePath: string): Promise<boolean> {
        const fileName = filePath;
        let response = null;
        try {
            response = await this._fetch(fileName, {
                method: 'DELETE'
            });
        } catch (error) {
            console.error(`Failed to delete file ${filePath}`, error);
        }
        const succeeded = response?.status === 204;
        if (succeeded) {
            return !(await this.fileExists(fileName));
        }
        return false;
    }
    /**
     * 
     * @param filePath 
     * @returns 
    */
    async DeleteProject(path: string): Promise<boolean> {
        const dirContent = await this.getContentMetadata(path, 'directory');

        if (!(dirContent && dirContent.type === 'directory')) {
            return false;
        }
        let success = false;

        for (const item of dirContent.content) {
            if (item.type === 'directory') {
                success = await this.DeleteProject(item.path);

            } else {
                success = await this.deleteProjectFile(item.path);
            }
        }
        success = await this.deleteProjectFile(path);
        return success;
    }
    /**
     * @returns base url 
    */
    private GetBaseUrl() {
        return URLExt.normalize(PageConfig.getBaseUrl());
    }
    /**
     * Return the model for a path.
     *
     * @param path Path
     * @param type Path type
     * @returns Element metadata
    */
    async getContentMetadata(
        path: string,
        type: 'file' | 'directory' = 'file'
    ): Promise<Contents.IModel | null> {
        const baseUrl = this.GetBaseUrl();
        const token = PageConfig.getToken();
        const apiUrl = 'api/contents';

        const data = {
            type,
            content: type === 'directory' ? 1 : 0
        };

        const request: RequestInit = {
            method: 'GET'
        };

        if (token) {
            request.headers = { Authorization: `Token ${token}`, CacheControl: "no-cache" };
        }

        let response: Response | null = null;
        try {
            const url = URLExt.join(baseUrl, apiUrl, path) + URLExt.objectToQueryString(data);
            response = await fetch(url, request);
        } catch (e) {
            console.log("ERROR message: " + (e as Error).message);
        }

        const succeeded = response?.status === 200;

        if (succeeded) {
            return response!.json();
        }

        return null;
    }
    /**
     * 
     * @param file_path the file path
     * @param request the request object
     * @returns a response object or null
    */
    private async _fetch(
        filePath: string,
        request: RequestInit = { method: 'GET' }
    ): Promise<Response | null> {
        const baseUrl = this.GetBaseUrl();
        const token = PageConfig.getToken();
        const apiUrl = 'api/contents';
        const url = URLExt.join(baseUrl, apiUrl, filePath);
        // type RequestCache = "default" | "force-cache" | "no-cache" | "no-store" | "only-if-cached" | "reload";
        if (token) {
            request.headers = { Authorization: `Token ${token}`, CacheControl: "reload" };
        }
        let response: Response | null = null;
        try {
            response = await fetch(url, request);
        } catch {
            return response;
        }
        return response;
    }
}