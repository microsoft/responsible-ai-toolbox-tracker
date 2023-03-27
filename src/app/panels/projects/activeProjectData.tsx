// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { useStore } from 'react-redux';
import React, { useEffect } from 'react';
import { PathExt } from '@jupyterlab/coreutils';
import { Label } from '@fluentui/react/lib/Label';
import { BookPanel } from '../notebook/bookPanel';
import { FontIcon } from '@fluentui/react/lib/Icon';
import { NotebookPanel } from '@jupyterlab/notebook';
import { useDispatch, useSelector } from 'react-redux';
import { notebookIcon, folderIcon } from '@jupyterlab/ui-components';
import { FocusZone, FocusZoneDirection } from '@fluentui/react-focus';
import { KeyCodes, getRTLSafeKeyCode } from '@fluentui/react/lib/Utilities';
import { TooltipHost, ITooltipHostStyles } from '@fluentui/react/lib/Tooltip';
import { Utils } from '../../../core/utils';
import { WorkModeData } from './projectUtils';

const hostStyles: Partial<ITooltipHostStyles> = { root: { display: 'inline-block' } };
export const ActiveProjectData: React.FunctionComponent = (props) => {
    const WORKSPACE_DIR = 'workspace';
    const ARTIFACTS_DIR = 'artifacts';
    /**
     * App state.
    */
    const state = useSelector((state) => state);
    const projectName = state['projectSettings']['name'];
    let majorMetric = state['projectSettings']['problemTypeMajorMetric'];
    const tooltipHeader1Id = 'tooltipNotebookHeader';
    const tooltipHeader2Id = 'tooltipRegisterModelHeader';
    const tooltipHeader3Id = 'tooltipAccuracyHeader';
    const tooltipProjectSettings = 'tooltipProjectSettings';
    const notebooks = state['projectSettings']['notebooks'];
    let showCompareModels = state['projectSettings']['showCompareModels'];
    let notebooksRestorer = state['projectSettings']['notebooksRestorer'];
    /**
     * Retrieve sorted data
    */
    const { items, sortItems, sortConfig } = WorkModeData(props.children);
    /**
     * Default major metric.
    */
    let problemType = state['projectSettings']['problemType'];
    if (majorMetric === undefined || majorMetric.length === 0) {
        if (problemType && problemType.toLowerCase() === 'classification') {
            majorMetric = 'Accuracy';
        } else if (problemType && problemType.toLowerCase() === 'regression') {
            majorMetric = 'mae';
        }
        else {
            majorMetric = '';
        }
    }
    const dispatch = useDispatch();
    const openProjectSettings = (event) => {
        dispatch({ type: 'PROJECT_PROPERTIES_MODAL_STATE', payload: true });
    };
    const store = useStore();
    /**
     * Build the widget before restoring it.
     * @param path 
     * @returns 
    */
    const BuildWidget = (path: string) => {
        const bookPanel = new BookPanel(store);
        let widget = bookPanel.initWidget(path);
        const notebookName = PathExt.basename(path);
        widget.id = notebookName;
        widget.title.label = notebookName;
        widget.title.icon = notebookIcon;
        widget.title.closable = true;
        return widget;
    }
    /**
     * Restore the open notebooks to the main panel.
    */
    useEffect(() => {
        if (notebooksRestorer && notebooksRestorer.length > 0) {
            let widgets: NotebookPanel[] = [];
            for (let path of notebooksRestorer) {
                if (!path || path.length === 0) { continue; }
                let widget = BuildWidget(path);
                if (widget) {
                    widgets.push(widget);
                }
            }
            state['restoreNotebooks'](widgets);
        }
    }, [notebooksRestorer]);
    /**
     * Initialize the context menu.
    */
    useEffect(() => {
        if (notebooks && notebooks.length > 0 && notebooks[0] !== undefined) {
            const path = PathExt.join(WORKSPACE_DIR, projectName, ARTIFACTS_DIR, notebooks[0].name);
            const bookPanel = new BookPanel(store);
            bookPanel.initContextMenu(path);
        }
    }, [notebooks]);
    /**
     * Restore the compare models vew.
    */
    useEffect(() => {
        if (showCompareModels) {
            state['openCompareModels']();
        }
    }, [showCompareModels]);
    /**
     * 
    */
    window.addEventListener("beforeunload", function (e) {
        state['closeNotebook']();
        const _utils = new Utils();
        _utils.UpdateBaseProjectSettings(state['projectSettings']);
        e.preventDefault();
    }, {
        // passive: true
    });

    // function _shouldEnterInnerZone(ev: React.KeyboardEvent<HTMLElement>): boolean {
    //     // eslint-disable-next-line deprecation/deprecation
    //     return ev.which === getRTLSafeKeyCode(KeyCodes.right);
    // }
    return (
        <div className="marginLeft" >
            <table className="ActiveProjectTitle">
                <tbody>
                    <tr>
                        <td id='propCol1'><folderIcon.react tag="div" className='projectIcon' /></td>
                        <td id='propCol2'><Label className='labelSubTextHeader'>{projectName}</Label></td>
                        <td id='propCol3'>
                            <TooltipHost content='Project Settings' id={tooltipProjectSettings} styles={hostStyles}>
                                <a tabIndex={0} onKeyPress={openProjectSettings} onClick={openProjectSettings} className="projectSettingsLinkStyle" id='projectSettingsLink' >
                                    <FontIcon aria-label="Project Settings" iconName="Settings" className="projectSettingsIcon" />
                                </a>
                            </TooltipHost>
                        </td>
                    </tr>
                </tbody>
            </table>
            <table className='dataTable'>
                <tbody>
                    <tr>
                        <td colSpan={2} className="NotebookTableHeader">
                            <Label className='dataTableHeader'>
                                <span className='spanTableHeader' onClick={() => sortItems('notebook')}>
                                    <TooltipHost content='Sort by notebook name' id={tooltipHeader1Id} styles={hostStyles}>
                                        Notebook
                                    </TooltipHost>
                                    {
                                        sortConfig && sortConfig.key === 'notebook' ? (
                                            sortConfig.direction === 'ascending' ? (
                                                <FontIcon aria-label="SortUp" iconName="SortUp" className='SortIcon' />
                                            ) : (
                                                <FontIcon aria-label="SortDown" iconName="SortDown" className='SortIcon' />)
                                        ) : ('')
                                    }
                                </span>
                            </Label>
                        </td>
                        <td className="ModelTableColumn">
                            <Label className='dataTableHeader'>
                                <span className='spanTableHeader'
                                    onClick={() => sortItems('model')}>
                                    <TooltipHost content='Sort by model registration' id={tooltipHeader2Id} styles={hostStyles}>
                                        &nbsp;Model
                                    </TooltipHost>
                                    {
                                        sortConfig && sortConfig.key === 'model' ? (
                                            sortConfig.direction === 'ascending' ? (
                                                <FontIcon aria-label="SortUp" iconName="SortUp" className='SortIcon' />
                                            ) : (
                                                <FontIcon aria-label="SortDown" iconName="SortDown" className='SortIcon' />)
                                        ) : ('')
                                    }
                                </span>
                            </Label>
                        </td>
                        <td className="AccuracyTableColumn">
                            <Label className='dataTableHeader'>
                                <span className='spanTableHeader'
                                    onClick={() => sortItems('accuracy')}>
                                    <TooltipHost content={`Sort by ` + majorMetric} id={tooltipHeader3Id} styles={hostStyles}>
                                        &nbsp;{majorMetric}
                                    </TooltipHost>
                                    {
                                        sortConfig && sortConfig.key === majorMetric ? (
                                            sortConfig.direction === 'ascending' ? (
                                                <FontIcon aria-label="SortUp" iconName="SortUp" className='SortIcon' />
                                            ) : (
                                                <FontIcon aria-label="SortDown" iconName="SortDown" className='SortIcon' />)
                                        ) : ('')
                                    }
                                </span>
                            </Label>
                        </td>
                    </tr>
                </tbody>
            </table>
            {/* <FocusZone direction={FocusZoneDirection.vertical}
                isCircularNavigation={true}
                shouldEnterInnerZone={_shouldEnterInnerZone}
                role="grid"
            > */}
            <table id='notebookTable' className='dataTableBody'>
                <tbody>
                    {
                        items.map((item) => (
                            <tr key={item.id}>
                                <td className="notebookIcon"><notebookIcon.react tag="div" /></td>
                                <td className="NotebookTableColumn" >{item.notebook}</td>
                                <td className="ModelTableColumn">{item.model}</td>
                                <td className="AccuracyTableColumn">{item.accuracy}</td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>
            {/* </FocusZone> */}
        </div>
    );
}
export default ActiveProjectData;