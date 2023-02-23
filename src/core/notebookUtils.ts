// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { UUID } from 'angular2-uuid';
import { CreateRun } from './mlflowUtils';
import { Widget } from '@lumino/widgets';
import { ArrayExt } from '@lumino/algorithm';
import { Contents } from '@jupyterlab/services';
import { ServiceManager } from '@jupyterlab/services';
import { DocumentManager } from '@jupyterlab/docmanager';
import { Dialog, showDialog } from '@jupyterlab/apputils';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import { URLExt, PageConfig, PathExt } from '@jupyterlab/coreutils';
import { renameFile } from '@jupyterlab/docmanager';
import {
    INotebookType,
    IMetricsType,
    INotebookMetricsType,
    IUpdatedArtifactsType
} from './components';

export class NotebookUtils {
    private docManager: DocumentManager;
    private readonly WORKSPACE_DIR = 'workspace';
    private readonly ARTIFACTS_DIR = 'artifacts';
    private projectId: string;
    private projectName: string;
    private _items: HTMLElement[] = [];
    protected selection: {
        [key: string]: boolean;
    };
    protected readonly EDITOR_CLASS = 'jp-DirListing-editor';
    private _sortedItems: any[];
    private _editNode: HTMLInputElement;
    private _selectedElement: HTMLElement;
    constructor() {
        /**
        * Create a document manager object 
        */
        if (!this.docManager) {
            this.docManager = this.InitializeDocumentManager();
        }

        this.selection = Object.create(null);
        this._items = [];
        this._sortedItems = [];

        this._editNode = document.createElement('input');
        this._editNode.className = this.EDITOR_CLASS;
    }
    /**
     * Initialize the document manager object
     * @returns A document manager object
     */
    private InitializeDocumentManager(): DocumentManager {
        const manager = new ServiceManager();
        const opener = {
            open: (widget: Widget) => { }
        }

        const docRegistry = new DocumentRegistry();
        const docManager = new DocumentManager({
            registry: docRegistry,
            manager,
            opener
        });
        return docManager;
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
    * Create a notebook
    * @param projectName 
    * @param projectId 
    * @param fileName 
    * @returns A notebook type object
    */
    async CreateNewNotebook(projectName: string = undefined, projectId: string = undefined, serverUri: string = undefined, fileName: string = undefined): Promise<INotebookType> {
        if (!projectName) {
            throw 'Project directory is missing';
        }
        const projectDirPath = PathExt.join(this.WORKSPACE_DIR, projectName, this.ARTIFACTS_DIR);
        let newFile = await this._createNewFile(projectDirPath);

        const defaultFilePath = PathExt.join(projectDirPath, newFile.name);

        await this.fileExists(defaultFilePath).then(content => {
            if (!content) {
                console.log('Failed to create a new notebook');
            }
        });
        /**
         * Rename the new file.
        */
        if (fileName) {
            let newFilePath = PathExt.join(projectDirPath, fileName);
            newFile = await this.RenameFile(defaultFilePath, newFilePath);
        }
        /**
         * Create an mlflow run id for each notebook
        */
        const mlFlowRunId = await CreateRun(serverUri);
        if (!mlFlowRunId) {
            console.log('mlflow run creation failed');
        }
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
        newNotebook.key = UUID.UUID();
        newNotebook.name = newFile.name;
        newNotebook.notebookVisible = false;
        newNotebook.mlFlowRunId = mlFlowRunId;
        newNotebook.registeredModel = '';
        newNotebook.mlPlatform = '';
        newNotebook.testDataset = '';
        newNotebook.testDatasetKey = '';
        newNotebook.metrics = notebookMetricsArr;
        newNotebook.dateCreated = dateTime.toLocaleDateString();
        newNotebook.lastUpdated = dateTime.toLocaleDateString();
        /**
         * update the  project settings file
        */
        await this.UpdateNotebookSettings(projectName, projectId, newNotebook);
        return newNotebook;
    }
    /**
     * Update the project settings file
     * @param projectName Update the project settings file
     * @param projectId 
     * @param newNotebook 
     * @returns a contents object
     */
    async UpdateNotebookSettings(projectName: string, projectId: string, newNotebook: INotebookType = undefined): Promise<Contents.IModel> {
        const projectFilePath = PathExt.join(this.WORKSPACE_DIR, projectName, projectId) + '.json';

        await this.fileExists(projectFilePath).then(content => {
            if (!content) {
                console.log('Project file is missing');
            }
        });
        const results = await this._readFile(projectFilePath);
        let projectContent = JSON.parse(results.content);

        if (newNotebook) {
            let notebookPath = PathExt.join(this.WORKSPACE_DIR, projectName, this.ARTIFACTS_DIR, newNotebook.name);
            if (!notebookPath.includes('.ipynb')) {
                notebookPath = notebookPath + '.ipynb';
            }
            newNotebook.path = notebookPath;
            projectContent.notebooks.push(newNotebook);
        }
        const projectContentJson = JSON.stringify(projectContent, null, '\t');
        const type: Contents.ContentType = 'file';
        const format: Contents.FileFormat = 'text';
        const model: Partial<Contents.IModel> = {
            type,
            format,
            name: projectName,
            content: projectContentJson
        };
        return await this.docManager.services.contents.save(projectFilePath, model);
    }
    /**
     * 
     * @param projectName 
     * @param projectId 
     * @param notebookName 
     * @param newNotebookName 
     * @returns 
    */
    async UpdateNotebookNameSettings(projectName: string, projectId: string, notebookName: string, newNotebookName: string): Promise<Contents.IModel> {
        const projectFilePath = PathExt.join(this.WORKSPACE_DIR, projectName, projectId) + '.json';

        await this.fileExists(projectFilePath).then(content => {
            if (!content) {
                console.log('Project file is missing');
            }
        });
        const results = await this._readFile(projectFilePath);
        let projectContent = JSON.parse(results.content);
        for (let i = 0; i < projectContent.notebooks.length; i++) {
            if (projectContent.notebooks[i].name === notebookName) {
                projectContent.notebooks[i].name = newNotebookName;
            }
        }
        const projectContentJson = JSON.stringify(projectContent, null, '\t');
        const type: Contents.ContentType = 'file';
        const format: Contents.FileFormat = 'text';
        const model: Partial<Contents.IModel> = {
            type,
            format,
            name: projectName,
            content: projectContentJson
        };
        return await this.docManager.services.contents.save(projectFilePath, model);
    }
    /**
     * Duplicate a file in the system.
     * @param projectName 
     * @param projectId 
     * @param serverUri 
     * @param filePath 
     * @returns 
     */
    async DuplicateNotebook(notebooks: INotebookType[] = undefined, projectName: string = undefined, projectId: string = undefined, serverUri: string = undefined, filePath: string = undefined): Promise<INotebookType> {
        /**
         * Validate parameters.
        */
        if (!projectName || !projectId || !serverUri || !filePath) {
            throw 'Duplicate Notebook method is missing parameters';
        }
        const duplicateSuffix = '-COPY';
        const dirPath = PathExt.dirname(filePath);
        const ext = PathExt.normalizeExtension(PathExt.extname(filePath));
        const baseName = PathExt.basename(filePath, ext);
        const newName = baseName + duplicateSuffix + ext;
        const newPath = PathExt.join(dirPath, newName);

        await this.fileExists(newPath).then(content => {
            if (content) {
                showDialog({
                    title: 'Duplicate file name.',
                    body: 'A file with the name ' + newName.toString() + ' already exists, rename it or duplicate another one.',
                    buttons: [Dialog.okButton({ label: 'Ok' })]
                }).then(result => {
                    return null;
                });
            }
        });

        /**
         * Get the newly created file.
        */
        const newFile = await this._duplicateFile(filePath, newPath);
        if (!newFile) {
            return undefined;
        }

        /**
         * Create an mlflow run id for each notebook
        */
        const mlFlowRunId = await CreateRun(serverUri);
        if (!mlFlowRunId) {
            console.log('mlflow run creation failed');
        }

        /**
         * Create a notebook object to update the client settings.
        */
        let dateTime = new Date();
        let newNotebook = {} as INotebookType;
        let metricsArr: IMetricsType[] = [];
        let notebookMetricsArr: INotebookMetricsType[] = [];
        let notebookMetrics = {} as INotebookMetricsType;
        notebookMetrics.key = "";
        notebookMetrics.name = "";
        notebookMetrics.metricsVisible = true;
        notebookMetrics.mapTo = ''; //todo: add the map to functionality
        notebookMetrics.metrics = metricsArr
        notebookMetricsArr.push(notebookMetrics);
        newNotebook.key = UUID.UUID();
        newNotebook.name = newFile.name;
        newNotebook.notebookVisible = false;
        newNotebook.mlFlowRunId = mlFlowRunId;
        newNotebook.registeredModel = '';
        newNotebook.mlPlatform = '';
        newNotebook.testDataset = '';
        newNotebook.testDatasetKey = '';
        newNotebook.metrics = notebookMetricsArr;
        newNotebook.dateCreated = dateTime.toLocaleDateString();
        newNotebook.lastUpdated = dateTime.toLocaleDateString();
        /**
         * update the  project settings file
        */
        await this.UpdateNotebookSettings(projectName, projectId, newNotebook);
        return newNotebook;
    }
    /**
     * Read a file 
     * @param filePath the file path
     * @returns IModel object
    */
    async _readNotebook(filePath: string): Promise<Contents.IModel> {
        const type: Contents.ContentType = 'notebook';
        const format: Contents.FileFormat = 'json'
        const options: Contents.IFetchOptions = {
            type,
            format,
            content: true,
        };
        return await this.docManager.services.contents.get(filePath, options);
    }
    /**
     * 
     * @param filePath 
     * @param notebookList 
     * @returns 
    */
    async GetNotebook(notebookPath: string, notebookList: any[]): Promise<INotebookType> {
        let _notebook = {} as INotebookType;
        const notebookName = PathExt.basename(notebookPath);

        for (let i = 0; i < notebookList.length; i++) {
            if (notebookList[i].name === notebookName) {
                _notebook = notebookList[i];
            }
        }
        return _notebook;
    }
    /**
     * Create a new file
     * 
     * @param filePath the new default file path
    */
    protected async _duplicateFile(filePath: string, newPath: string): Promise<Contents.IModel> {
        return await this.docManager.copy(filePath, newPath);
    }
    /**
     * Create a new file
     * 
     * @param defaultFilePath the new default file path
    */
    protected async _createNewFile(defaultFilePath: string): Promise<Contents.IModel> {
        const type: Contents.ContentType = 'notebook';
        const options: Contents.ICreateOptions = {
            path: defaultFilePath,
            type
        };
        return await this.docManager.services.contents.newUntitled(options);
    }
    /**
     * Rename a file
     *
     * @param oldFileName Old file name
     * @param newFileName New file name
     * @returns Action success status
    */
    async RenameFile(oldFileName: string, newFileName: string): Promise<Contents.IModel> {
        await this.fileExists(newFileName).then(content => {
            if (content) {
                return; //todo: return a message for the user
            }
        });
        const renamedFile = await this.docManager.services.contents.rename(oldFileName, newFileName);

        await this.fileExists(newFileName).then(content => {
            if (content) {
                return renamedFile;
            }
        });
        return null;//todo: return a message for the user
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
        const apiUrl = `${baseUrl}api/contents`;
        const data = {
            type,
            content: type === 'directory' ? 1 : 0
        };
        const request: RequestInit = {
            method: 'GET'
        };
        if (token) {
            request.headers = { Authorization: `Token ${token}` };
        }
        let response: Response | null = null;
        try {
            response = await fetch(`${apiUrl}/${path}` + URLExt.objectToQueryString(data), request);
        } catch (error) {
            console.log(`Fail to get content metadata for ${path}`, error);
        }
        const succeeded = response?.status === 200;
        if (succeeded) {
            return response!.json();
        }
        return null;
    }
    /**
     * 
     * @param notebookName 
     * @returns 
    */
    validateNotebookName(nbName: string) {
        if (!nbName) { return false; }
        const validNameExp = /[\/\\\<\>\?:]/;
        const ext = PathExt.extname(nbName);
        const _name = PathExt.basename(nbName, ext);
        if (!_name.replace(/\s/g, '').length) {
            return false;
        }
        if (_name.replace(/\s/g, '') === '.ipynb') {
            return false;
        }
        if (_name.length > 0 && _name.length < 101 && !validNameExp.test(_name)) {
            return true;
        }
        return false;
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
     * @param name 
     * @param notebooks 
     * @returns 
    */
    async _doRename(name: string, notebooks: INotebookType[] = undefined) {
        const items = this._sortedItems;
        const index = ArrayExt.findFirstIndex(items, value => value.name === name);
        const nameNode = this._selectedElement;
        const original = name;
        this._editNode.value = original;
        this._selectItem(index, false);
        return doRename(nameNode, this._editNode, original).then(
            newName => {
                this._selectedElement.focus();
                if (!newName || newName === original) {
                    return original;
                }
                if (!this.validateNotebookName(newName)) {
                    showDialog({
                        title: 'Invalid file name.',
                        body: 'Name length should be between 1 and 100 characters, and not include “/“, “\”, "<", ">", "?", or “:”',
                        buttons: [Dialog.okButton({ label: 'Ok' })]
                    }).then(result => {
                        return original;
                    });
                    return original;
                }
                const manager = this.docManager;
                const oldPath = PathExt.join(this.WORKSPACE_DIR, this.projectName, this.ARTIFACTS_DIR, original);
                const newPath = PathExt.join(this.WORKSPACE_DIR, this.projectName, this.ARTIFACTS_DIR, newName);
                /**
                 * if the new name already exists then return undefined.
                 */
                if (this.inTheSystem(newName, original, notebooks)) {
                    showDialog({
                        title: 'Duplicate file name.',
                        body: 'A file with the name ' + newName.toString() + ' already exists, choose a different name.',
                        buttons: [Dialog.okButton({ label: 'Ok' })]
                    }).then(result => {
                        return original;
                    });
                    return original;
                } else {
                    const promise = renameFile(manager, oldPath, newPath);
                    return promise
                        .catch(error => {
                            return original;
                        })
                        .then(() => {
                            return newName;
                        });
                }

            }
        );
    }
    /**
     * 
     * @param index 
     * @returns 
    */
    private _focusSelectedFile(index?: number): void {
        if (index === -1) {
            return;
        }
        const text = this._selectedElement;
        if (text) {
            text.focus();
        }
    }
    /**
     * Select a given item.
     */
    private _selectItem(
        index: number,
        focus: boolean = true
    ) {
        // Selected the given row(s)
        const items = this._sortedItems;
        const path = PathExt.join(this.WORKSPACE_DIR, this.projectName, items[index].name);
        this.selection[path] = true;

        if (focus) {
            this._focusSelectedFile(index);
        }
    }
    /**
     * 
     * @param name 
     * @param focus 
    */
    async selectItemByName(name: string, focus: boolean = false): Promise<void> {

        const items = this._sortedItems;
        const index = ArrayExt.findFirstIndex(items, value => value.name === name);
        if (index === -1) {
            console.log('Item does not exist.')
        }
        this._selectItem(index, focus);
    }
    /**
     * 
     * @param name 
     * @param notebooks 
     * @returns 
    */
    private inTheSystem(name: string, oldName: string, notebooks: INotebookType[] = undefined) {
        /**
         * Account for the creation of a notebook without rename it.
         */
        if (name === oldName) { return true; }
        for (let i in notebooks) {
            if (notebooks[i].name === name) {
                return true;
            }
        }
        // return this.validateNotebookName(name);
        return false;
    }
    /**
     * 
     * @param projectName 
     * @param projectId 
     * @param notebook 
     * @param notebooks 
     * @returns 
    */
    async FocusNewNotebook(projectName: string = undefined, projectId: string = undefined, notebook: INotebookType = undefined,
        notebooks: INotebookType[] = undefined): Promise<IUpdatedArtifactsType> {

        this.projectId = projectId;
        this.projectName = projectName;
        this._sortedItems = notebooks;
        this._selectedElement = document.getElementById(notebook.name);
        this._items.push(this._selectedElement);
        const originalName = notebook.name;
        let oldPath = notebook?.path;
        if (!oldPath) {
            oldPath = PathExt.join(this.WORKSPACE_DIR, projectName, this.ARTIFACTS_DIR, originalName);
        }
        await this.selectItemByName(notebook.name, true);
        const newName = await this._doRename(notebook.name, notebooks);
        const newPath = PathExt.join(this.WORKSPACE_DIR, projectName, this.ARTIFACTS_DIR, newName);

        if (newName === originalName) {
            return undefined;
        }
        if (!this.validateNotebookName(newName)) {
            return undefined;
        }
        const projectFilePath = PathExt.join(this.WORKSPACE_DIR, projectName, projectId) + '.json';
        const results = await this._readFile(projectFilePath);
        let projectContent = JSON.parse(results.content);
        if (projectContent.baseNotebookModel === originalName) {
            projectContent.baseNotebookModel = newName;
        }
        for (let i = 0; i < projectContent.notebooks.length; i++) {
            if (projectContent.notebooks[i].name === originalName) {
                projectContent.notebooks[i].name = newName;
                projectContent.notebooks[i].path = newPath;
            }
        }
        // update selected models settings.
        const index = projectContent.selectedModels?.indexOf(originalName);
        if (index !== -1) {
            projectContent.selectedModels?.splice(index, 1);
            projectContent.selectedModels.push(newName);
        }
        const index2 = projectContent.notebooksRestorer.indexOf(oldPath);
        if (index2 !== -1) {
            projectContent.notebooksRestorer?.splice(index2, 1);
            projectContent.notebooksRestorer.push(newPath);
        }
        /**
         * update the restorer state.
        */
        const projectContentJson = JSON.stringify(projectContent, null, '\t');
        const type: Contents.ContentType = 'file';
        const format: Contents.FileFormat = 'text';
        const model: Partial<Contents.IModel> = {
            type,
            format,
            name: projectName,
            content: projectContentJson
        };
        await this.docManager.services.contents.save(projectFilePath, model);
        notebook.name = newName;
        notebook.path = newPath;
        const artifacts = {} as IUpdatedArtifactsType;
        artifacts.notebook = notebook;
        artifacts.notebookList = notebooks;
        artifacts.notebooksRestorer = projectContent.notebooksRestorer;
        artifacts.selectedModels = projectContent.selectedModels;
        return artifacts;
    }
}
/**
 * 
 * @param text 
 * @param edit 
 * @param original 
 * @returns 
*/
export function doRename(
    text: HTMLElement,
    edit: HTMLInputElement,
    original: string
): Promise<string> {
    const parent = text.parentElement as HTMLElement;
    parent.replaceChild(edit, text);
    edit.focus();
    const index = edit.value.lastIndexOf('.');
    if (index === -1) {
        edit.setSelectionRange(0, edit.value.length);
    } else {
        edit.setSelectionRange(0, index);
    }

    return new Promise<string>((resolve, reject) => {
        edit.onblur = () => {
            parent.replaceChild(text, edit);
            resolve(edit.value);
        };
        edit.onkeydown = (event: KeyboardEvent) => {
            switch (event.keyCode) {
                case 13: // Enter
                    event.stopPropagation();
                    event.preventDefault();
                    edit.blur();
                    break;
                case 27: // Escape
                    event.stopPropagation();
                    event.preventDefault();
                    edit.value = original;
                    edit.blur();
                    break;
                case 38: // Up arrow
                    event.stopPropagation();
                    event.preventDefault();
                    if (edit.selectionStart !== edit.selectionEnd) {
                        edit.selectionStart = edit.selectionEnd = 0;
                    }
                    break;
                case 40: // Down arrow
                    event.stopPropagation();
                    event.preventDefault();
                    if (edit.selectionStart !== edit.selectionEnd) {
                        edit.selectionStart = edit.selectionEnd = edit.value.length;
                    }
                    break;
                default:
                    break;
            }
        };
    });
}

