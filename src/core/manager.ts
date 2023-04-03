// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { raiUI } from '../app';
import { Utils } from './utils';
import { PathExt } from '@jupyterlab/coreutils';
import { ReactWidget } from '@jupyterlab/apputils';
import {
  applyMiddleware,
  Store,
  legacy_createStore as createStore
} from 'redux';
import {
  IWorkspaceType,
  IProjectType,
  IColorValuesType
} from './components'
import {
  ClientState,
  ClientReducer,
  createInitialState,
  setCompareModelsOpener,
  setRestoreNotebooks,
  setNotebookOpener,
  setNotebookCloser
} from './store';
import { NotebookPanel } from '@jupyterlab/notebook';
import * as configs_json from '../configs/configs.json';
/**
 * project instance type
*/
export type ProjectInstance = {
  store: Store,
  projectName: string
};

export class Manager {
  private readonly WORKSPACE_DIR = 'workspace';
  private readonly WORKSPACE_FILE_NAME = 'workspace.json';
  readonly ui: raiUI;
  public instances: ProjectInstance[];
  private __activeInstance: ProjectInstance;
  private _utils: Utils;
  private _workspace: IWorkspaceType;
  private _project: IProjectType;
  private _problemTypes: any;
  private _mlPlatforms: any;
  private _serverUri: string;
  private resetColorsDefault: boolean;
  private heatmapColors: IColorValuesType;
  public _initialState: ClientState;  
  private readonly closeNotebook: (
    paths: string[]
  ) => void;
  private readonly openNotebook: (
    path: string
  ) => NotebookPanel;
  private readonly restoreNotebooks: (
    widgets: string[],
    store: Store,
    showCompareModels: boolean
  ) => string[];
  private readonly openCompareModels: (
    store: Store
  ) => ReactWidget;
  constructor(
    ui: raiUI = undefined,
    restoreNotebooks = undefined,
    openNotebook = undefined,
    closeNotebook = undefined,
    openCompareModels = undefined
  ) {
    this.ui = ui;
    this.openNotebook = openNotebook;
    this.closeNotebook = closeNotebook;
    this.restoreNotebooks = restoreNotebooks;
    this.openCompareModels = openCompareModels;
    this.instances = [];
    this.__activeInstance = undefined;
    this._utils = new Utils();
  }
  /**
   * dispose of all instances
  */
  public dispose() {
    this.instances = [];
  }
  /**
   * get active instance
  */
  public get activeInstance() {
    return this.__activeInstance;
  }
  /**
   * set active instance
  */
  public set activeInstance(inst: ProjectInstance) {
    this.__activeInstance = inst;
    this.ui.activeInstance = inst;
    this.ui.update();
  }
  /**
   * Retrieve a project instance
   * @returns active project instance
  */
  async GetProjectInst() {
    if (!this.activeInstance) {
      const configs = configs_json;
      this._serverUri = configs.serverUri;
      if (!this._serverUri) {
        console.log('mlFlow Server Uri is not defined');
      }
      this._mlPlatforms = await this._utils.GetMlPlatforms();
      if (!this._mlPlatforms) {
        console.log('Supported ML Platforms are not defined');
      }
      this._problemTypes = await this._utils.GetProblemTypes();
      if (!this._problemTypes) {
        console.log('Problem types are not defined');
      }
      /**
       * Make sure the workspace dir is created
      */
      let dirExists = false;
      await this._utils.directoryExists(this.WORKSPACE_DIR).then(content => {
        if (content) {
          dirExists = true;
        }
      });
      if (!dirExists) {
        await this._utils.CreateWorkspaceFolder();
      }
      const workspaceFilePath = PathExt.join(this.WORKSPACE_DIR, this.WORKSPACE_FILE_NAME);
      let fileExists = false;
      await this._utils.fileExists(workspaceFilePath).then(content => {
        if (content) {
          fileExists = true;
        }
      });
      if (!fileExists) { return undefined; }
      this._workspace = await this._utils.GetWorkspaceSettings();
      if (!this._workspace || !this._workspace.activeProject) { return undefined; }
      this._project = await this._utils.GetProjectSettings(this._workspace.activeProject, this._workspace.activeProjectId);
      if (!this._project) {
        return undefined;
      }
      this.heatmapColors = this._project.heatmapColors;
      this.resetColorsDefault = this._project.resetColorsDefault;
      const project_Inst = this.CreateProjectInstance();
      this.activeInstance = project_Inst;
    }
    else {
      return this.activeInstance;
    }
  }
  /**
   *  Create new rai instance
   * @param projectName 
   * @returns store and a quick access to project name
   */
  CreateProjectInstance(): ProjectInstance {
    this._initialState = createInitialState(this._workspace, this._project, this._problemTypes, this._mlPlatforms, this._serverUri, this.resetColorsDefault, this.heatmapColors);
    const store: Store = createStore(
      ClientReducer,
      this._initialState,
      applyMiddleware()
    );
    store.dispatch(
      setRestoreNotebooks((widgets: string[], store: Store = undefined, showCompareModels: boolean = false) => {
        return this.restoreNotebooks(widgets, store, showCompareModels);
      })
    );
    store.dispatch(
      setNotebookOpener((path: string) => {
        return this.openNotebook(path);
      })
    );
    store.dispatch(
      setNotebookCloser((paths: string[]) => {
        this.closeNotebook(paths);
      })
    );
    store.dispatch(
      setCompareModelsOpener(() => {
        this.openCompareModels(store);
      })
    );
    const projectName = this._workspace?.activeProject;
    return { store, projectName };
  }
  /**
   * Switch projectInst instance
   * @param projectInst 
   */
  switchActiveInstances(projectInst: any) {
    if (!this.activeInstance || this.activeInstance !== projectInst) {
      this.activeInstance = projectInst;
    }
  }
}
