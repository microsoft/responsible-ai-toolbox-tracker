// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { Store } from "redux";
import { Signal } from "@lumino/signaling";
import { ServiceManager } from '@jupyterlab/services';
import { CompareModels } from './app/panels/models'
import { notebookIcon } from '@jupyterlab/ui-components';
import { Manager, ProjectInstance } from './core/manager';
import { PathExt, PageConfig } from "@jupyterlab/coreutils";
import { MainAreaWidget, WidgetTracker } from '@jupyterlab/apputils';
import {
  LayoutRestorer,
  ILayoutRestorer,
  LabShell,
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
  ConnectionLost,
  IConnectionLost,
} from '@jupyterlab/application';
import {
  NotebookPanel,
  INotebookTracker,
  NotebookTracker
} from "@jupyterlab/notebook";
import { raiUI } from './app';
import { BookPanel } from './app/panels/notebook/bookPanel';
import '../style/index.css';
const PLUGIN_ID = 'responsible-ai-tracker';

const extension: JupyterFrontEndPlugin<void> = {
  id: PLUGIN_ID,
  autoStart: true,
  requires: [ILayoutRestorer, INotebookTracker],
  optional: [IConnectionLost],
  activate: (
    app: JupyterFrontEnd,
    restorer: LayoutRestorer,
    nTracker: NotebookTracker,
    connectionLost: IConnectionLost | null
  ) => {
    PageConfig.setOption('treePath', '');
    let namespace = 'compareModels';
    let wTracker = new WidgetTracker({ namespace });
    /**
     * Open the compare models features from the left panel.
     * @param store 
     * @returns 
    */
    const openCompareModels = (store: Store) => {
      let currentWidget = getCompareModelsWidget(wTracker, app.shell);
      if (!currentWidget) {
        _openCompareModels(app, wTracker, store).then((currentWidget) => {
        })
      } else {
        if (!currentWidget.isAttached) {
          app.shell.add(currentWidget, "main");
        }
        app.shell.activateById(currentWidget.id);
      }
      return currentWidget;
    }
    /**
     * 
     * @param paths 
    */
    const closeNotebook = async (paths: string[] = undefined) => {
      if (paths) {
        for (let i in paths) {
          const path = paths[i];
          const w = getNotebookWidget(nTracker, app.shell, path) as NotebookPanel;
          if (w) {
            w.close();
          }
        }
      }
      else {
        /**
         * Reset Jupyter lab workspace
         */
        updateWorkspace(app);
      }
    }
    /**
     * 
     * @param path 
     * @returns 
    */
    const openNotebook = async (path: string) => {
      let nWidget = getNotebookWidget(nTracker, app.shell, path);
      if (nWidget) {
        if (!nWidget.isAttached) {
          app.shell.add(nWidget, 'main');
        }
        app.shell.activate();
        app.shell.activateById(nWidget.id);
      }
      else {
        nWidget = await _openNotebook(app, path, nTracker);
      }
      return nWidget;
    }
    /**
     * A notebook Utility restore method.
     * @param path  
     * @param closeFile 
     * @param oldPath 
     * @returns 
    */
    const restoreNotebooks = async (widgets: NotebookPanel[]): Promise<string[]> => {
      /**
       * close all notebook widgets tracked by the jupyterlab default browser.
      */
      if (!widgets) {
        nTracker.dispose();
        return;
      }
      /**
       * reopen notebooks under the RAI app context.
      */
      let restorerList: string[] = [];
      if (widgets) {
        for (let w of widgets) {
          const tWidget = getNotebookWidget(nTracker, app.shell, w.context.path) as NotebookPanel;
          if (tWidget) {
            if (!tWidget.isAttached) {
              app.shell.add(tWidget, 'main');
              app.shell.activateById(tWidget.id);
              await tWidget.context.save();
            }
          }
          else {
            if (!w.isAttached) {
              app.shell.add(w, 'main');
              app.shell.activateById(w.id);
            }
            if (!nTracker.has(w)) {
              await nTracker.add(w);
            }
            await w.context.save();
          }
          restorerList.push(w.context.path);
        }
      }
      const activeMainWidgetId = _projectInstance?.store.getState()?.projectSettings.activeMainWidgetId;
      if (activeMainWidgetId && activeMainWidgetId.length > 0) {
        (app.shell as LabShell).activateById(activeMainWidgetId);
      }
      return restorerList;
    }
    /**
     * Rai left panel.
    */
    const leftPanel = new raiUI();
    const manager = new Manager(
      leftPanel,
      restoreNotebooks,
      openNotebook,
      closeNotebook,
      openCompareModels
    );
    /**
     * Add the extension left panel to the Jupyterlab UI.
    */
    app.shell.add(leftPanel, 'left', { rank: 600 });
    /**
     * Add the rai panel to the restorer.
    */
    if (restorer) {
      restorer.add(leftPanel, leftPanel.id);
    }
    (app.shell as LabShell).disposed.connect(() => {
      Signal.clearData(this);
    });
    app.restored.then(() => {
      UpdateProjectView(manager).then(() => {
        const activeLeftWidgetId = _projectInstance?.store.getState()?.projectSettings.activeLeftWidgetId;
        if (activeLeftWidgetId && activeLeftWidgetId.length > 0) {
          (app.shell as LabShell).activateById(activeLeftWidgetId);
        } else if (!activeLeftWidgetId || activeLeftWidgetId === "") {
          (app.shell as LabShell).activateById("raiPanel");
        }
      });
    });
    /**
     * Save the left panel active widget for restoration.
     * @param e 
    */
    window.addEventListener("beforeunload", function (e) {
      const layout = (app.shell as LabShell).saveLayout();
      _projectInstance?.store.dispatch({ type: 'SET_LEFT_CURRENT_WIDGET', payload: layout.leftArea.currentWidget.id });
      _projectInstance?.store.dispatch({ type: 'SET_MAIN_CURRENT_WIDGET', payload: layout.mainArea.currentWidget.id });
      e.preventDefault();
    }, {
      passive: true
    });

    connectionLost = connectionLost || ConnectionLost;
    app.serviceManager.connectionFailure.connect((manager, error) =>
      _connectionLost!(manager, error)
    );

  }
}
const _connectionLost: IConnectionLost = async function (manager: ServiceManager.IManager, err: any): Promise<void> {
  console.log("LOCAL CONNECTION TRAP")
  return;
};
/**
 * 
 * @param app 
*/
async function updateWorkspace(app: JupyterFrontEnd) {
  try {
    await app.serviceManager.workspaces.remove('default');
  }
  catch (reason) {
    console.log(`Workspace does not exist: ${reason}`);
  }

}
let _projectInstance: ProjectInstance = undefined;
/**
 * Update the extension UI with the current widget / notebook.
 * @param manager 
*/
async function UpdateProjectView(
  manager: Manager
) {
  _projectInstance = await manager.GetProjectInst();
  if (!_projectInstance) {
    _projectInstance = manager.CreateProjectInstance();
    manager.switchActiveInstances(_projectInstance);
  }
}
/**
 * Get the current widget and activate unless the args specify otherwise.
 * @param wTracker 
 * @param shell 
 * @returns 
*/
function getCompareModelsWidget(wTracker: WidgetTracker, shell: JupyterFrontEnd.IShell) {
  let el: any;
  wTracker?.forEach(element => {
    if (element) {
      // shell.activateById(element.id);
      el = element;
      return element;
    }
  });
  if (el) { return el; }
  return null;
}
/**
 * 
 * @param app 
 * @param wTracker 
 * @param store 
*/
async function _openCompareModels(
  app: JupyterFrontEnd,
  wTracker: WidgetTracker,
  store: Store
) {
  const content = new CompareModels(store);
  const currentWidget = new MainAreaWidget({ content });
  currentWidget.id = 'compareModels';
  if (!currentWidget.isAttached) {
    app.shell.add(currentWidget, "main");
  }
  app.shell.activateById(currentWidget.id);
  if (!wTracker.has(currentWidget)) {
    await wTracker.add(currentWidget);
  }
  return currentWidget;
}
/**
 * 
 * @param wTracker 
 * @param shell 
 * @param path 
 * @returns 
*/
function getNotebookWidget(nTracker: NotebookTracker, shell: JupyterFrontEnd.IShell, path: string) {
  let el: any;
  nTracker.forEach(element => {
    if (PathExt.basename(path).toLowerCase() === element.id.toLowerCase()) {
      shell.activateById(element.id);
      el = element;
      return element;
    }
  });
  if (el) { return el; }
  return null;
}
/**
 * The open notebook method creates and instantiates a notebook panel,
 * update the settings and bind it to the UI main panel.
 * @param app 
 * @param store 
 * @param path 
 * @param wTracker 
*/
async function _openNotebook(
  app: JupyterFrontEnd,
  path: string,
  nTracker: NotebookTracker
) {
  const bookPanel = new BookPanel(_projectInstance.store);
  let nWidget = bookPanel.initWidget(path, nTracker);
  const notebookName = PathExt.basename(path);
  const name = notebookName;
  nWidget.id = name;
  nWidget.title.label = notebookName;
  nWidget.title.icon = notebookIcon;
  nWidget.title.closable = true;
  if (!nWidget.isAttached) {
    app.shell.add(nWidget, "main");
  }
  app.shell.activateById(nWidget.id);
  if (!nTracker.has(nWidget)) {
    nWidget.content.update();
    await nTracker.add(nWidget);
  }
  return nWidget;
}
export default extension;
