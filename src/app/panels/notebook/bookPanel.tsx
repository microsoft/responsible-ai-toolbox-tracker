// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React from 'react';
import { Store } from 'redux';
import { CommandRegistry } from '@lumino/commands';
import { ToolbarButton } from '@jupyterlab/apputils';
import { ServiceManager } from '@jupyterlab/services';
import { editorServices } from '@jupyterlab/codemirror';
import { MathJaxTypesetter } from '@jupyterlab/mathjax2';
import { DocumentManager } from '@jupyterlab/docmanager';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import { PageConfig, PathExt } from '@jupyterlab/coreutils';
import { clearIcon, LabIcon } from '@jupyterlab/ui-components';
import { IDisposable, DisposableDelegate } from '@lumino/disposable';
import { CommandPalette, SplitPanel, Widget, Menu } from '@lumino/widgets';
import { TranslationBundle, TranslationManager } from '@jupyterlab/translation';
import {
    standardRendererFactories as initialFactories,
    RenderMimeRegistry
} from '@jupyterlab/rendermime';
import {
    NotebookActions,
    NotebookModelFactory,
    NotebookPanel,
    NotebookTracker,
    NotebookWidgetFactory,
} from '@jupyterlab/notebook';
import {
    Completer,
    CompleterModel,
    CompletionHandler,
    KernelConnector
} from '@jupyterlab/completer';
import { Utils } from '../../../core/utils';
import { SetupCommands } from './commands';
import { INotebookType } from '../../../core/components';
import lightbulbHelp from '../../../../style/img/help.svg';
import { NotebookUtils } from '../../../core/notebookUtils';
export const notebookInfo = { name: '', path: '' };
export const raiHelpIcon = new LabIcon({ name: 'raiHelp', svgstr: lightbulbHelp, });

export class BookPanel extends React.Component<Store> {
    readonly WORKSPACE_DIR = 'workspace';
    readonly ARTIFACTS_DIR = 'artifacts';
    protected _node: Element;
    protected activeWidget: NotebookPanel;
    protected widgetList: NotebookPanel[];
    protected _useCapture = true;
    protected trans: TranslationBundle;
    protected docManager: DocumentManager;
    protected nTracker: NotebookTracker;
    private projectId: string;
    private projectName: string;
    private instanceState: any;
    /**
      * instantiate the util object.
     */
    constructor(props: Store) {
        super(props);
        const translator = new TranslationManager();
        translator.fetch('en');
        this.trans = translator.load('jupyterlab');

        this.instanceState = this.props.getState();

        this.projectId = this.instanceState.projectId;
        this.projectName = this.instanceState.projectName;
    }
    /**
     * Custom event listener for the context menu.
     * @param element 
     * @param type 
     * @param handler 
    */
    protected addEventListener<T extends EventTarget, E extends Event>(
        element: T, type: string, handler: (this: T, evt: E) => void) {
        element.addEventListener(type, handler as (evt: Event) => void);
    }
    /**
     * 
     * @param widget 
     */
    protected focus(widget: Widget): void {
        widget.node.focus();
    }
    /**
     * 
     * @param notebookPath 
     * @returns 
    */
    public initWidget(notebookPath: string = undefined, tracker: NotebookTracker = undefined) {
        this.nTracker = tracker;
        const panel = new SplitPanel();
        panel.node.tabIndex = -1;
        if (!this.widgetList) {
            this.widgetList = this.instanceState.widgetList;
        }
        const manager = new ServiceManager();
        const commands = new CommandRegistry();
        // Setup the keydown listener for the document.
        document.addEventListener(
            'keydown',
            event => {
                commands.processKeydownEvent(event);
            }, { capture: true }
        );
        const rendermime = new RenderMimeRegistry({
            initialFactories: initialFactories,

            latexTypesetter: new MathJaxTypesetter({
                url: PageConfig.getOption('mathjaxUrl'),
                config: PageConfig.getOption('mathjaxConfig')
            })
        });
        const opener = {
            open: (widget: NotebookPanel) => {
                if (this.widgetList?.indexOf(widget) === -1) {
                    panel.addWidget(widget);
                    this.widgetList?.push(widget);
                }
                panel.activate();
                widget.activate();
                this.activeWidget = widget;

                widget.disposed.connect((w: NotebookPanel) => {
                    const index = this.widgetList?.indexOf(w);
                    if (index !== -1) {
                        this.widgetList?.splice(index, 1);
                    }
                    const i = this.instanceState.projectSettings.notebooksRestorer.indexOf(w.context.path);
                    if (i !== -1) {
                        const _utils = new Utils();
                        this.instanceState.projectSettings.notebooksRestorer.splice(i, 1);
                        _utils.UpdateBaseProjectSettings(this.instanceState.projectSettings);
                    }
                });
                this.props.dispatch({ type: 'ACTIVE_WIDGET_LIST', payload: this.widgetList });
            },
            get opened() {
                return {
                    connect: () => {
                        return false;
                    },
                    disconnect: () => {
                        return false;
                    }
                };
            }
        };
        const docRegistry = new DocumentRegistry();
        const mFactory = new NotebookModelFactory({});
        const editorFactory = editorServices.factoryService.newInlineEditor;
        const contentFactory = new NotebookPanel.ContentFactory({ editorFactory });
        const wFactory = new NotebookWidgetFactory({
            name: this.trans.__('Editor'),
            modelName: 'notebook',
            fileTypes: ['text', 'notebook'],
            defaultFor: ['notebook'],
            preferKernel: true,
            canStartKernel: true,
            rendermime,
            contentFactory,
            mimeTypeService: editorServices.mimeTypeService,
        });
        docRegistry.addModelFactory(mFactory);
        docRegistry.addWidgetFactory(wFactory);
        this.docManager = new DocumentManager({
            registry: docRegistry,
            manager,
            opener
        });
        let nbWidget = this.docManager.openOrReveal(notebookPath) as NotebookPanel;
        nbWidget.context.lastModifiedCheckMargin = Number.MAX_SAFE_INTEGER;
        const palette = new CommandPalette({ commands });
        palette.addClass('notebookCommandPalette');
        const editor = nbWidget.content?.activeCell && nbWidget.content?.activeCell?.editor;
        const model = new CompleterModel();
        const completer = new Completer({ editor, model });
        const sessionContext = nbWidget.context.sessionContext;
        sessionContext.kernelPreference = { autoStartDefault: true };
        const connector = new KernelConnector({
            session: sessionContext.session
        });
        const handler = new CompletionHandler({ completer, connector });
        void sessionContext.ready.then(() => {

            handler.connector = new KernelConnector({
                session: sessionContext.session
            });
        });
        // Listen for active cell changes.
        nbWidget.content.activeCellChanged.connect((sender, cell) => {
            handler.editor = cell && cell.editor;
        });
        completer.hide();
        panel.id = 'main';
        panel.orientation = 'horizontal';
        panel.spacing = 0;
        panel.addWidget(palette);
        SplitPanel.setStretch(palette, 0);
        SplitPanel.setStretch(nbWidget, 1);
        panel.addWidget(nbWidget);
        Widget.attach(completer, document.body);
        window.addEventListener("resize", function (e) {
            panel.update();
            e.preventDefault();
        }, {
            passive: true
        });
        document.addEventListener('focus', event => {
            for (let i = 0; i < this.widgetList?.length; i++) {
                const widget = this.widgetList[i];
                if (widget.node.contains(event.target as HTMLElement)) {
                    this.activeWidget = widget;
                    break;
                }
            }
            event.preventDefault();
        }, {
            passive: true
        });
        this.initContextMenu(notebookPath);
        this.createClearOutputs(nbWidget);
        this.createErrorsMitigationHelp(nbWidget);
        SetupCommands(commands, palette, nbWidget, handler);
        return nbWidget;
    }
    /**
     * 
     * @param panel 
     * @returns 
    */
    private createErrorsMitigationHelp(
        panel: NotebookPanel,
    ): IDisposable {
        const insertCell = () => {
            const cell = panel.model!.contentFactory.createMarkdownCell({});
            cell.mimeType = "text/markdown";
            cell.value.text = errorsMitigationHelp;
            panel.model!.cells.insert(0, cell);
            NotebookActions.runAndAdvance(panel.content, panel.context.sessionContext);
        };
        const btnInsertHelp = new ToolbarButton({
            className: 'insert-cell-above-button',
            icon: raiHelpIcon,
            onClick: insertCell,
            tooltip: 'Responsible AI Mitigation Help'
        });
        panel.toolbar.insertItem(11, 'Help', btnInsertHelp);
        return new DisposableDelegate(() => {
            btnInsertHelp.dispose();
        });
    }
    /**
     * 
     * @param panel 
     * @returns 
    */
    private createClearOutputs(
        panel: NotebookPanel,
    ): IDisposable {
        const clearOutputs = () => {
            NotebookActions.clearAllOutputs(panel.content);
        };
        const btnClearOutputs = new ToolbarButton({
            className: 'clear-output-button',
            icon: clearIcon,
            onClick: clearOutputs,
            tooltip: 'Clear All Outputs',
            enabled: true,
        });

        panel.toolbar.insertItem(5, 'clearOutputs', btnClearOutputs);
        return new DisposableDelegate(() => {
            btnClearOutputs.dispose();
        });
    }
    /**
     * 
     * @param projectName 
     * @param projectId 
     * @param serverUri 
     * @returns 
    */
    private _duplicateNotebook(notebooksList: INotebookType[] = undefined, projectName: string = undefined, projectId: string = undefined,
        serverUri: string = undefined, notebookPath: string = undefined, nbUtils: NotebookUtils = undefined): Promise<INotebookType> {
        return nbUtils.DuplicateNotebook(notebooksList, projectName, projectId, serverUri, notebookPath)
            .then(response => {
                return response;
            }).catch((error: Error) => {
                return null;
            });
    }
    /**
     * Get the notebooks list.
     * @returns 
    */
    private getNotebooks() {
        const notebooksList = this.instanceState.projectSettings.notebooks;
        let _notebooksList: any[] = [];
        if (notebooksList) {
            _notebooksList = JSON.parse(JSON.stringify(notebooksList));
        }
        return _notebooksList;
    }
    /**
     * 
     * @param widget 
     * @param name 
     * @param path 
     */
    private async updateWidgetTitle(widget: NotebookPanel, name: string, path: string) {
        await widget.context.sessionContext.session.setPath(path);
        await widget.context.sessionContext.session.setName(name);
        await widget.context.save();
    }
    /**
     * 
     * @param notebookPath 
    */
    private duplicateNotebook(notebookPath: string): void {
        const nbUtils = new NotebookUtils();
        const projectName = this.instanceState.projectSettings.name;
        const serverUri = this.instanceState.serverUri;
        let notebooksList = this.getNotebooks();
        this._duplicateNotebook(notebooksList, projectName, this.projectId, serverUri, notebookPath, nbUtils).then(
            notebook => {
                if (notebook !== null) {
                    if (notebooksList.indexOf(notebook) === -1) {
                        notebooksList.push(notebook);
                    }
                    this.props.dispatch({ type: 'REFRESH_NOTEBOOK_LIST', payload: notebooksList });
                    nbUtils.FocusNewNotebook(projectName, this.projectId, notebook, notebooksList)
                        .then(content => {
                            if (content) {
                                notebook = content.notebook;
                            }
                            /**
                            * Update notebook list
                            */
                            const index = notebooksList.indexOf(notebook)
                            if (index === -1) {
                                notebooksList.push(notebook);
                            } else {
                                notebooksList[index] = notebook;
                            }
                            this.props.dispatch({ type: 'REFRESH_NOTEBOOK_LIST', payload: notebooksList });
                        });
                }
            }
        );
    }
    /**
     * 
     * @param notebookPath 
    */
    private renameFile(notebookPath: string) {
        const nbUtils = new NotebookUtils();
        let projectSettings = this.instanceState.projectSettings;
        let notebooksList = this.getNotebooks();
        if (!this.widgetList) {
            this.widgetList = this.instanceState.widgetList;
        }
        nbUtils.GetNotebook(notebookPath, notebooksList).then(
            notebook => {
                const oldName = notebook.name;
                nbUtils.FocusNewNotebook(projectSettings.name, projectSettings.key, notebook, notebooksList).then(artifacts => {
                    if (artifacts?.notebook) {
                        for (let index in this.widgetList) {
                            const widget = this.widgetList[index];
                            if (widget.title.label === oldName) {
                                widget.id = artifacts.notebook.name;
                                this.updateWidgetTitle(widget, artifacts.notebook.name, artifacts.notebook.path).then(content => {
                                    this.widgetList[index] = widget;
                                    this.instanceState.projectSettings.notebooksRestorer = [];
                                    this.instanceState.projectSettings.notebooksRestorer = artifacts.notebooksRestorer;
                                });
                                break;
                            }
                        }
                        this.instanceState.projectSettings.notebookList = artifacts.notebookList;
                        this.instanceState.projectSettings.notebooksRestorer = artifacts.notebooksRestorer;
                        this.instanceState.projectSettings.selectedModels = artifacts.selectedModels;
                        this.props.dispatch({ type: 'REFRESH_NOTEBOOK_LIST', payload: artifacts.notebookList });
                        this.props.dispatch({ type: 'NOTEBOOKS_RESTORER', payload: artifacts.notebooksRestorer });
                        this.props.dispatch({ type: 'PROJECT_SETTINGS', payload: this.instanceState.projectSettings });
                        // this.props.dispatch({ type: 'SELECTED_MODELS_VISUAL', payload: artifacts.selectedModels });
                    }
                    else {
                        //do nothing.
                        // console.log("The name already exists, choose another one.");
                    }
                });
            }
        );
    }
    /**
     * 
     * @param notebookPath 
    */
    private confirmDeleteFile(notebookPath: string): void {
        const notebookName = PathExt.basename(notebookPath);
        notebookInfo.name = notebookName;
        notebookInfo.path = notebookPath;
        if (!this.widgetList) {
            this.widgetList = this.instanceState.widgetList;
        }
        this.props.dispatch({ type: 'ACTIVE_WIDGET_LIST', payload: this.widgetList });
        this.props.dispatch({ type: 'NOTEBOOK_DELETE_DIALOG_STATE', payload: false });
    }
    /**
     * 
     * @param notebookPath 
    */
    public initContextMenu(notebookPath: string = undefined): void {
        const commands = new CommandRegistry();

        if (!this.widgetList) {
            this.widgetList = this.instanceState.widgetList;
        }

        commands.addCommand('file-open', {
            label: this.trans.__('Open'),
            icon: 'fa fa-folder-open-o',
            mnemonic: 0,
            execute: async () => {
                let nWidget = await this.instanceState.openNotebook(notebookPath);
                nWidget.context.save();
                if (this.instanceState.projectSettings.notebooksRestorer.indexOf(notebookPath) === -1) {
                    const _utils = new Utils();
                    this.instanceState.projectSettings.notebooksRestorer.push(notebookPath);
                    _utils.UpdateBaseProjectSettings(this.instanceState.projectSettings);
                }
            }
        });

        commands.addCommand('file-rename', {
            label: this.trans.__('Rename'),
            icon: 'fa fa-edit',
            mnemonic: 0,
            execute: () => {
                this.renameFile(notebookPath);
            }
        });

        commands.addCommand('file-save', {
            label: this.trans.__('Save'),
            icon: 'fa fa-save',
            execute: () => {
                for (let index in this.widgetList) {
                    const nWidget = this.widgetList[index];
                    if (nWidget.context.path === notebookPath) {
                        // this.saveFileContext(nWidget);
                        nWidget.context.save();
                    }
                }
            }
        });

        commands.addCommand('file-duplicate', {
            label: this.trans.__('Duplicate'),
            icon: 'fa fa-copy',
            mnemonic: 0,
            execute: () => {
                this.duplicateNotebook(notebookPath);
            }
        });

        commands.addCommand('file-delete', {
            label: this.trans.__('Delete'),
            icon: 'fa fa-remove',
            mnemonic: 0,
            execute: () => {
                let nWidget: NotebookPanel;
                for (let index in this.widgetList) {
                    if (this.widgetList[index].context.path === notebookPath) {
                        nWidget = this.widgetList[index];

                    }
                }
                // this.saveFileContext(nWidget);
                if (nWidget) {
                    nWidget.context.save().then(() => {
                        this.confirmDeleteFile(notebookPath);
                    });
                } else {
                    this.confirmDeleteFile(notebookPath);
                }
            }
        });
        commands.addKeyBinding({
            keys: ['Enter'],
            selector: '.jp-DirListing',
            command: 'file-open'
        });
        commands.addKeyBinding({
            selector: '.jp-Notebook',
            keys: ['Accel S'],
            command: 'file-save'
        });

        commands.addKeyBinding({
            selector: '.jp-Notebook',
            keys: ['Ctrl S'],
            command: 'file-save'
        });
        document.addEventListener('keydown', event => {
            commands.processKeydownEvent(event);
        }, { capture: true });
        // Create a context menu.
        const menu = new Menu({ commands });
        menu.addItem({ command: 'file-open' });
        menu.addItem({ command: 'file-rename' });
        menu.addItem({ command: 'file-save' });
        menu.addItem({ command: 'file-duplicate' });
        menu.addItem({ command: 'file-delete' });
        menu.activate();
        if (!this._node) {
            this._node = document.getElementsByClassName('dataTableBody')[0];
        }
        if (this._node) {
            this.addEventListener(this._node, "contextmenu", (event: MouseEvent) => {
                event.preventDefault();
                event.stopImmediatePropagation();
                const x = event.clientX;
                const y = event.clientY;
                notebookPath = PathExt.join(this.WORKSPACE_DIR, this.projectName, this.ARTIFACTS_DIR, event.target['id']);
                if (event.target['className'] === 'openNotebookLink') {
                    menu.open(x, y);
                }
            });
        }
    }
}
const errorsMitigationHelp = "### [**Responsible AI Mitigation Library**](https://responsible-ai-toolbox-mitigations.readthedocs.io/en/latest/)\n\n<details> \n<summary>Encoders</summary>\n  \n  [**Link to Encoders**](https://responsible-ai-toolbox-mitigations.readthedocs.io/en/latest/dataprocessing/encoder/encoder.html)\n    The Encoders API allows for ordinal or one-hot encoding of categorical features.\n\n  ```py\n  classdataprocessing.EncoderOrdinal(df: Optional[Union[DataFrame, ndarray]] = None, col_encode: Optional[list] = None, categories: Union[dict, str] = 'auto', unknown_err: bool = False, unknown_value: Union[int, float] = -1, verbose: bool = True))\n\n\n  ```\n  [**One Hot Encoding**](https://responsible-ai-toolbox-mitigations.readthedocs.io/en/latest/dataprocessing/encoder/ordinal.html)\n\n  ```py\n  classdataprocessing.EncoderOHE(df: Optional[Union[DataFrame, ndarray]] = None, col_encode: Optional[list] = None, drop: bool = True, unknown_err: bool = True, verbose: bool = True\n  ```\n</details>\n\n<details> \n<summary>Feature Selection</summary>\n\n[Link to Feature Selection](https://responsible-ai-toolbox-mitigations.readthedocs.io/en/latest/dataprocessing/feat_sel/feat_sel.html)\nThe Feature Selection API enables selecting a subset of features that are the most informative for the prediction task.\n\n  \n  [**Sequential Feature Selection**](https://responsible-ai-toolbox-mitigations.readthedocs.io/en/latest/dataprocessing/feat_sel/seq.html)\n\n  ```py\n  classdataprocessing.SeqFeatSelection(df: Optional[Union[DataFrame, ndarray]] = None, label_col: Optional[str] = None, X: Optional[Union[DataFrame, ndarray]] = None, y: Optional[Union[DataFrame, ndarray]] = None, transform_pipe: Optional[list] = None, in_place: bool = False, regression: Optional[bool] = None, estimator: Optional[BaseEstimator] = None, n_feat: Union[int, str, tuple] = 'best', fixed_cols: Optional[list] = None, cv: int = 3, scoring: Optional[str] = None, forward: bool = True, save_json: bool = False, json_summary: str = 'seq_feat_summary.json', n_jobs: int = 1, verbose: bool = True))\n\n\n  ```\n  [**Feature Selection via Gradient Boosting**](https://responsible-ai-toolbox-mitigations.readthedocs.io/en/latest/dataprocessing/feat_sel/catboost.html)\n\n  ```py\n  classdataprocessing.CatBoostSelection(df: Optional[Union[DataFrame, ndarray]] = None, label_col: Optional[str] = None, X: Optional[Union[DataFrame, ndarray]] = None, y: Optional[Union[DataFrame, ndarray]] = None, transform_pipe: Optional[list] = None, regression: Optional[bool] = None, estimator: Optional[Union[CatBoostClassifier, CatBoostRegressor]] = None, in_place: bool = False, catboost_log: bool = True, catboost_plot: bool = False, test_size: float = 0.2, cat_col: Optional[list] = None, n_feat: Optional[int] = None, fixed_cols: Optional[list] = None, algorithm: str = 'loss', steps: int = 1, save_json: bool = False, json_summary: str = 'cb_feat_summary.json', verbose: bool = True))\n\n\n  ```\n  [**Feature Selection via Removing Correlated Features**](https://responsible-ai-toolbox-mitigations.readthedocs.io/en/latest/dataprocessing/feat_sel/correlation.html)\n\n  ```py\n  classdataprocessing.CorrelatedFeatures(df: Optional[Union[DataFrame, ndarray]] = None, label_col: Optional[str] = None, X: Optional[Union[DataFrame, ndarray]] = None, y: Optional[Union[DataFrame, ndarray]] = None, transform_pipe: Optional[list] = None, in_place: bool = False, cor_features: Optional[list] = None, method_num_num: list = ['spearman'], num_corr_th: float = 0.85, num_pvalue_th: float = 0.05, method_num_cat: str = 'model', levene_pvalue: float = 0.01, anova_pvalue: float = 0.05, omega_th: float = 0.9, jensen_n_bins: Optional[int] = None, jensen_th: float = 0.8, model_metrics: list = ['f1', 'auc'], metric_th: float = 0.9, method_cat_cat: str = 'cramer', cat_corr_th: float = 0.85, cat_pvalue_th: float = 0.05, tie_method: str = 'missing', save_json: bool = True, json_summary: str = 'summary.json', json_corr: str = 'corr_pairs.json', json_uncorr: str = 'uncorr_pairs.json', compute_exact_matches: bool = True, verbose: bool = True)\n  ```\n</details>\n\n<details> \n<summary>Imputers</summary>\n\n[Link to Imputers](https://responsible-ai-toolbox-mitigations.readthedocs.io/en/latest/dataprocessing/imputer/imputer.html)\nThe Imputer API enables a simple approach for replacing missing values across several columns with different parameters, simultaneously replacing with the mean, median, most constant, or most frequent value in a dataset.\n\n  \n  [**Basic Imputation**](https://responsible-ai-toolbox-mitigations.readthedocs.io/en/latest/dataprocessing/imputer/basic.html)\n\n  ```py\n  classdataprocessing.BasicImputer(df: Optional[Union[DataFrame, ndarray]] = None, col_impute: Optional[list] = None, categorical: Optional[dict] = None, numerical: Optional[dict] = None, specific_col: Optional[dict] = None, verbose: bool = True)\n  ```\n</details>\n\n<details> \n<summary>Sampling</summary>\n\n[Link to Sampling](https://responsible-ai-toolbox-mitigations.readthedocs.io/en/latest/dataprocessing/sampler/sampler.html)\nThe Sampling API enables data augmentation by rebalancing existing data or synthesizing new data.\n\n\n  [**Data Rebalance**](https://responsible-ai-toolbox-mitigations.readthedocs.io/en/latest/dataprocessing/sampler/rebalance.html)\n\n  ```py\n  classdataprocessing.Rebalance(df: Optional[Union[DataFrame, ndarray]] = None, rebalance_col: Optional[str] = None, X: Optional[Union[DataFrame, ndarray]] = None, y: Optional[Union[DataFrame, ndarray]] = None, transform_pipe: Optional[list] = None, in_place: bool = False, cat_col: Optional[list] = None, strategy_over: Optional[Union[str, dict, float]] = None, k_neighbors: int = 4, over_sampler: Union[BaseSampler, bool] = True, strategy_under: Optional[Union[str, dict, float]] = None, under_sampler: Union[BaseSampler, bool] = False, n_jobs: int = 1, verbose: bool = True))\n\n\n  ```\n  [**Data Synthesis**](https://responsible-ai-toolbox-mitigations.readthedocs.io/en/latest/dataprocessing/sampler/synthesizer.html)\n\n  ```py\n  classdataprocessing.Synthesizer(df: Optional[DataFrame] = None, label_col: Optional[str] = None, X: Optional[DataFrame] = None, y: Optional[DataFrame] = None, transform_pipe: Optional[list] = None, in_place: bool = False, model: Union[BaseTabularModel, str] = 'ctgan', epochs: int = 50, save_file: Optional[str] = None, load_existing: bool = True, verbose: bool = True)\n  ```\n</details>\n\n<details> \n<summary>Scalers</summary>\n\n[Link to Scalers](https://responsible-ai-toolbox-mitigations.readthedocs.io/en/latest/dataprocessing/scaler/scaler.html)\nThe Scaler API enables applying numerical scaling transformations to several features at the same time.\n\n  \n  [**Data Standardization Scaling**](https://responsible-ai-toolbox-mitigations.readthedocs.io/en/latest/dataprocessing/scaler/standard.html)\n\n  ```py\n  classdataprocessing.DataStandardScaler(scaler_obj: Optional[StandardScaler] = None, df: Optional[Union[DataFrame, ndarray]] = None, exclude_cols: Optional[list] = None, include_cols: Optional[list] = None, transform_pipe: Optional[list] = None, verbose: bool = True))\n\n\n  ```\n  [**Min Max Scaling**](https://responsible-ai-toolbox-mitigations.readthedocs.io/en/latest/dataprocessing/scaler/minmax.html)\n\n  ```py\n  classdataprocessing.DataMinMaxScaler(scaler_obj: Optional[MinMaxScaler] = None, df: Optional[Union[DataFrame, ndarray]] = None, exclude_cols: Optional[list] = None, include_cols: Optional[list] = None, transform_pipe: Optional[list] = None, verbose: bool = True))\n\n\n  ```\n  [**Quantile Transformer Scaling**](https://responsible-ai-toolbox-mitigations.readthedocs.io/en/latest/dataprocessing/scaler/quantile.html)\n\n  ```py\n  classdataprocessing.DataQuantileTransformer(scaler_obj: Optional[QuantileTransformer] = None, df: Optional[Union[DataFrame, ndarray]] = None, exclude_cols: Optional[list] = None, include_cols: Optional[list] = None, transform_pipe: Optional[list] = None, verbose: bool = True))\n\n\n  ```\n  [**Power Transformer Scaling**](https://responsible-ai-toolbox-mitigations.readthedocs.io/en/latest/dataprocessing/scaler/power.html)\n\n  ```py\n  classdataprocessing.DataPowerTransformer(scaler_obj: Optional[PowerTransformer] = None, df: Optional[Union[DataFrame, ndarray]] = None, exclude_cols: Optional[list] = None, include_cols: Optional[list] = None, transform_pipe: Optional[list] = None, verbose: bool = True))\n\n\n  ```\n  [**Robust Statistics Scaling**](https://responsible-ai-toolbox-mitigations.readthedocs.io/en/latest/dataprocessing/scaler/robust.html)\n\n  ```py\n  classdataprocessing.DataRobustScaler(scaler_obj: Optional[RobustScaler] = None, df: Optional[Union[DataFrame, ndarray]] = None, exclude_cols: Optional[list] = None, include_cols: Optional[list] = None, transform_pipe: Optional[list] = None, verbose: bool = True))\n\n\n  ```\n  [**Data Normalization Scaling**](https://responsible-ai-toolbox-mitigations.readthedocs.io/en/latest/dataprocessing/scaler/normalize.html)\n\n  ```py\n  classdataprocessing.DataNormalizer(scaler_obj: Optional[Normalizer] = None, df: Optional[Union[DataFrame, ndarray]] = None, exclude_cols: Optional[list] = None, include_cols: Optional[list] = None, transform_pipe: Optional[list] = None, verbose: bool = True)\n  ```\n\n  \n</details>\n"
