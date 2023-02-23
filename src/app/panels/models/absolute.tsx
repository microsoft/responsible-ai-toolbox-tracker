// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React, { useState } from 'react';
import { PathExt } from '@jupyterlab/coreutils';
import { Label } from '@fluentui/react/lib/Label';
import { FontIcon } from '@fluentui/react/lib/Icon';
import { useSelector, useDispatch } from 'react-redux';
import { CommandBarButton } from '@fluentui/react/lib/Button';
import { DirectionalHint, TooltipHost, ITooltipHostStyles } from '@fluentui/react';
import { IOverflowSetItemProps, OverflowSet } from '@fluentui/react/lib/OverflowSet';
import { Stack, IStackStyles, IStackTokens, IStackItemStyles } from '@fluentui/react/lib/Stack';
import { Utils } from '../../../core/utils';
import { modelsStatsSorted } from './modelsUtils';
import { IColorValuesType } from '../../../core/components';
import { getAbsoluteShading, absoluteHeatmapData } from './heatmap';


export const Absolute: React.FunctionComponent = (props) => {
    const ERROR_CODE = -99;
    const WORKSPACE_DIR = 'workspace';
    const ARTIFACTS_DIR = 'artifacts';
    const dispatch = useDispatch();
    const state = useSelector((state) => state);
    const projectSettings = state['projectSettings'];
    let datasets = projectSettings['datasets'];
    let notebooks = projectSettings['notebooks'];
    const problemType = projectSettings['problemType'];
    const heatmapColors = projectSettings['heatmapColors'];
    let selectedModels = projectSettings['selectedModels'];
    let selectedCohorts = projectSettings['selectedCohorts'];
    let selectedMetricKeys = projectSettings['selectedMetrics'];
    let selectedCohortsKeys = projectSettings['selectedCohorts'];
    let toggleVisualDisplay = projectSettings['toggleVisualDisplay'];
    const resetColorsDefault = projectSettings['resetColorsDefault'];
    let absoluteVisualDisplay = projectSettings['absoluteVisualDisplay'];
    const baseNotebookModelKey = projectSettings['baseNotebookModelKey'];
    const tooltipTestHeader2Id = 'tooltipTestHeader';
    const tooltipNotebookHeaderId = 'tooltipNotebookHeader';
    const tooltipSortByMetricHeaderId = 'tooltipSortByMetricHeader';
    /**
     * The absolute view colors.
    */
    let userColorSelections = {} as IColorValuesType;
    const setHeatmapColors = () => {
        userColorSelections.comparativeDeclineColor = heatmapColors['comparativeDeclineColor'];
        userColorSelections.comparativeImprovementColor = heatmapColors['comparativeImprovementColor'];
        userColorSelections.absoluteColor = heatmapColors['absoluteColor'];
    }
    setHeatmapColors();
    /**
     * Sorting functionality.
    */
    let { items, sortItems, sortConfig } = modelsStatsSorted(props.children);

    /**
      * Set and update the baseline model settings.
      * @param baseNotebookModel 
      * @param baseNotebookModelKey 
      * @returns 
    */
    const updateBaselineModelSettings = async (baseNotebookModel: string, baseNotebookModelKey: string) => {
        const _utils = new Utils();
        return _utils.UpdateBaselineModel(projectSettings, baseNotebookModel, baseNotebookModelKey)
            .then(response => {
                return response;
            })
            .catch((error: Error) => {
                return false;
            });
    }
    /**
     * Update UI baseline models
     * @param event 
     * @param item 
     */
    const updateBaselineModel = (event: React.FormEvent<CommandBarButton>, item: IOverflowSetItemProps): void => {
        if (item) {
            updateBaselineModelSettings(item.value, item.key);
            dispatch({ type: 'UPDATE_COMPARE_MODEL_VIEW', payload: projectSettings });
        }
    }
    /**
     * 
     * @param toggleVisualDisplay 
     * @param absoluteVisualDisplay 
     * @param baselineVisualDisplay 
     * @param baseNotebookModel 
     * @returns 
    */
    const updateSelectedModels = async (toggleVisualDisplay: boolean = undefined, absoluteVisualDisplay: boolean = undefined, baselineVisualDisplay: boolean = undefined, baseNotebookModel: string = undefined) => {
        const _utils = new Utils();
        return _utils.UpdateCompareModelsSettings(projectSettings, baseNotebookModel, baseNotebookModelKey, toggleVisualDisplay, absoluteVisualDisplay, baselineVisualDisplay, selectedMetricKeys, selectedModels)
            .then(response => {
                return response;
            })
            .catch((error: Error) => {
                return false;
            });
    }
    /**
     * Hide the selected notebook/model record from view in the ui.
     * @param event 
     * @param item 
    */
    const hideFromView = (event: React.FormEvent<CommandBarButton>, item: IOverflowSetItemProps): void => {
        if (item) {
            if (selectedModels.indexOf(item.key) !== -1) {
                const index = selectedModels.indexOf(item.key, 0);
                if (index > -1) {
                    selectedModels.splice(index, 1);
                }
            }
        }
        updateSelectedModels();
        dispatch({ type: 'SELECTED_MODELS_VISUAL', payload: selectedModels });
    }
    /**
     * Update the project settings.
    */
    const _updateProjectSettings = async (notebookName: string, _utils: Utils) => {
        return _utils.UpdateProjectSettings(projectSettings, undefined, undefined, undefined, undefined, undefined, undefined, notebooks, notebookName)
            .then(response => {
                return response;
            })
            .catch((error: Error) => {
                console.log("Unregister notebook update settings error:" + error.message);
            });
    }
    /**
     * 
     * @param resource 
    */
    const updateDatasetSettings = async (resource: any) => {
        let _datasets: any[] = [];
        for (let db of datasets) {
            if (db.name !== resource.name) {
                _datasets.push(db);
            }
        }
        datasets = _datasets;
        projectSettings['datasets'] = _datasets;
    }
    /**
    * 
    * @param resources 
   */
    const updateNotebookSettings = async (resources: any[], notebookName: string) => {
        for (let notebook of notebooks) {
            if (notebook.name === notebookName) {
                notebook.registeredModel = '';
                notebook.mlPlatform = '';
                notebook.testDataset = '';
                notebook.testDatasetKey = '';
                notebook.metrics = [];
            }
        }
        projectSettings['notebooks'] = notebooks;
        /**
         * update the selected models list.
        */

        if (selectedModels.indexOf(notebookName) !== -1) {
            const index = selectedModels.indexOf(notebookName, 0);
            if (index !== -1) {
                selectedModels.splice(index, 1);
                projectSettings['selectedModels'] = selectedModels;
                dispatch({ type: 'SELECTED_MODELS_VISUAL', payload: selectedModels });
            }
        }
        for (let res of resources) {
            if (res.delete) {
                switch (res.key) {
                    case 'name':
                        const cohortIndex = selectedCohorts.indexOf(res.name, 0);
                        if (cohortIndex !== -1) {
                            selectedCohorts.splice(cohortIndex, 1);
                            projectSettings['selectedCohorts'] = selectedCohorts;
                            dispatch({ type: 'SELECTED_COHORTS_VISUAL', payload: selectedCohorts });
                        }
                        await updateDatasetSettings(res);
                        break;
                    default:
                        break;
                }
            }
        }
    }
    /**
     * Unregister the selected model.
     * @param event 
     * @param item 
    */
    const unregisterModel = async (event: React.FormEvent<CommandBarButton>, item: IOverflowSetItemProps): Promise<void> => {
        if (item) {
            // setWaitSpinner(true);
            const _utils = new Utils();
            const projectDir = PathExt.join(WORKSPACE_DIR, projectSettings.name);
            const notebookPath = PathExt.join(projectDir, ARTIFACTS_DIR, item.notebookName);

            /**
             * Identify the resources that should be delete it.
            */
            let resources = await _utils.identifyResources(notebooks, item.notebookName);

            /**
             * Delete the notebook resources.
            */
            const success = await _utils.deleteNotebookResources(projectSettings.name, resources, notebookPath, true);
            if (success) {
                await updateNotebookSettings(resources, item.notebookName);
                /**
                 * Resources are deleted. Notebooks and datasets settings state are updated. Update the project settings.
                */
                _updateProjectSettings(item.notebookName, _utils).then(content => {
                    if (content) {
                        dispatch({ type: 'PROJECT_SETTINGS', payload: projectSettings });
                    }
                    else {
                        //todo: raise an error
                    }
                    //setWaitSpinner(false);
                }).catch((error: Error) => {
                    console.log("Unregister model update error: " + error.message);
                    //setWaitSpinner(false);
                });
            } else {
                //setWaitSpinner(false);
                console.log("Failed to delete all notebook resources.")
            }
        }
    }
    /**
     * The three dots features.
     * @param overflowItems 
     * @returns 
    */
    const onRenderOverflowButton = (overflowItems: any[] | undefined): JSX.Element => {
        return (
            <TooltipHost content="More items" directionalHint={DirectionalHint.rightCenter}>
                <CommandBarButton
                    role="menuitem"
                    aria-label="Edits model settings"
                    styles={onRenderOverflowButtonStyles}
                    menuIconProps={{ iconName: 'More' }}
                    menuProps={{ items: overflowItems! }}
                />
            </TooltipHost>
        );
    }
    /**
     * On menu item render.
     * @param item 
     * @returns 
    */
    const onRenderItem = (item: IOverflowSetItemProps): JSX.Element => {
        return (
            <TooltipHost content={item.title} directionalHint={DirectionalHint.rightCenter}>
                <CommandBarButton
                    role="menuitem"
                    aria-label={item.name}
                    styles={onRenderItemStyles}
                    iconProps={{ iconName: item.icon }}
                    onClick={item.onClick}
                />
            </TooltipHost>
        );
    }
    const [metricHighLow, metricsGlobalHighLow] = absoluteHeatmapData(items, problemType, selectedCohortsKeys);
    /**
     * Inline styles for Fluent components.
    */
    const hostStyles: Partial<ITooltipHostStyles> = {
        root: { display: 'inline-block', alignContent: 'left', verticalAlign: 'center' }
    };
    const headerStackTokens: IStackTokens = {
        childrenGap: 2,
    };
    const headerStyles: IStackItemStyles = {
        root: {
            alignContent: 'center',
            alignItems: 'center',
            justifyContent: 'center',
            verticalAlign: 'bottom',
            height: '10px',
            width: '100%',
        },
    };
    const stackStyles: IStackStyles = {
        root: {
            alignItems: 'center',
        },
    };
    const stackTokens = { childrenGap: 0 };
    const dbStackItemStyles: IStackItemStyles = {
        root: {
            paddingLeft: 5,
            width: 160,
            alignItems: 'left',
            alignContent: 'left',
            textAlign: 'left',
        },
    };
    const stackItemStyles: IStackItemStyles = {
        root: {
            paddingLeft: 5,
            width: 135,
            alignItems: 'left',
            alignContent: 'left',
            textAlign: 'left',
        },
    };
    const stackItemEndStyles: IStackItemStyles = {
        root: {
            width: 40,
            alignItems: 'right',
            alignContent: 'right',
            textAlign: 'right',
        },
    };
    const onRenderOverflowButtonStyles = {
        root: {
            minWidth: 0,
            padding: '0 4px',
            alignSelf: 'stretch',
            height: 'auto',
        },
        menuIcon: { fontSize: '14px' },
    };
    const onRenderItemStyles = {
        root: {
            minWidth: 0,
            padding: '0 4px',
            alignSelf: 'stretch',
            height: 'auto',
        },
    };

    return (
        <>            
            <table className='modelsTable'>
                <thead>
                    <tr key="absoluteModelsHeaders">
                        <th>
                            <Label className='notebookHeader'>
                                <span onClick={() => sortItems('notebookName')}>
                                    <TooltipHost content='Sort by notebook name' id={tooltipNotebookHeaderId} styles={hostStyles}>
                                        Notebook
                                    </TooltipHost>
                                    {
                                        sortConfig && sortConfig.key === 'notebookName' ? (
                                            sortConfig.direction === 'asc' ? (
                                                <FontIcon aria-label="SortUp" iconName="SortUp" className='SortIcon' />
                                            ) : (
                                                <FontIcon aria-label="SortDown" iconName="SortDown" className='SortIcon' />)
                                        ) : (<FontIcon aria-label="SortDown" iconName="SortDown" className='hiddenElement' />)
                                    }
                                </span>
                            </Label>
                        </th>
                        <th>
                            <Label className='testDataTableHeader'>
                                <span onClick={() => sortItems('testDataset')}>
                                    <TooltipHost content='Sort by test dataset (Group by notebook)' id={tooltipTestHeader2Id} styles={hostStyles}>
                                        Cohort
                                    </TooltipHost>
                                    {
                                        sortConfig && sortConfig.key === 'testDataset' ? (
                                            sortConfig.direction === 'asc' ? (
                                                <FontIcon aria-label="SortUp" iconName="SortUp" className='SortIcon' />
                                            ) : (
                                                <FontIcon aria-label="SortDown" iconName="SortDown" className='SortIcon' />)
                                        ) : (<FontIcon aria-label="SortDown" iconName="SortDown" className='hiddenElement' />)
                                    }
                                </span>
                            </Label>
                        </th>
                        {
                            selectedMetricKeys.map((metric, key) => (
                                <th key={key + `_` + metric}>
                                    <div className='modelsMetricsHeader' onClick={() => sortItems(metric)}>
                                        <TooltipHost content={'Sort by ' + metric + ' (Group by notebook)'} id={tooltipSortByMetricHeaderId + metric} styles={hostStyles}>
                                            {metric}
                                        </TooltipHost>
                                        {
                                            sortConfig && sortConfig.key === metric ? (
                                                sortConfig.direction === 'asc' ? (
                                                    <FontIcon aria-label="SortUp" iconName="SortUp" className='SortIcon' />
                                                ) : (
                                                    <FontIcon aria-label="SortDown" iconName="SortDown" className='SortIcon' />)
                                            ) : (<FontIcon aria-label="SortDown" iconName="SortDown" className='hiddenElement' />)
                                        }
                                    </div>
                                    {
                                        absoluteVisualDisplay === true && toggleVisualDisplay === true ? (
                                            <Stack
                                                horizontal={true}
                                                horizontalAlign='center'
                                                verticalAlign='center'
                                                styles={headerStyles}
                                                tokens={headerStackTokens}
                                            >
                                                <Stack.Item className="metricLegend">
                                                    {
                                                        problemType === 'regression' ? (
                                                            <span>{metricHighLow[metric][1]}</span>
                                                        ) : (
                                                            <span>{metricHighLow[metric][0]}</span>
                                                        )
                                                    }
                                                </Stack.Item>
                                                {
                                                    metric === 'Log Loss' || metric === 'mse' || metric === 'rmse' || metric === 'mae' ? (
                                                        <Stack.Item className="_metricLegend">
                                                            <div title={metric}>&nbsp;</div>
                                                        </Stack.Item>
                                                    ) : (

                                                        <Stack.Item className="metricLegend">
                                                            <div title={metric}>&nbsp;</div>
                                                        </Stack.Item>
                                                    )
                                                }
                                                <Stack.Item className="metricLegend">
                                                    {
                                                        problemType === 'regression' ? (
                                                            <span>{metricHighLow[metric][0]}</span>
                                                        ) : (
                                                            <span>{metricHighLow[metric][1]}</span>
                                                        )
                                                    }
                                                </Stack.Item>
                                            </Stack>
                                        ) : (<></>)
                                    }
                                </th>
                            ))
                        }
                    </tr>
                </thead>
                <tbody>
                    {
                        items.map((item) => (
                            item.notebookVisible === true ? (
                                item.metrics.map((record, key) => (
                                    record.metricsVisible === true ? (
                                        <tr key={item.key + `_` + item.name + `_` + record.key}>
                                            {
                                                record.firstNotebook === true && record.lastNotebook === true ||
                                                    record.firstNotebook === true && record.lastNotebook === false && item.rowspan === 1 ? (
                                                    <td id="">
                                                        {
                                                            item.isBaseModel !== true ? (
                                                                <Stack
                                                                    horizontal
                                                                    horizontalAlign='center'
                                                                    verticalAlign='center'
                                                                    styles={stackStyles}
                                                                    tokens={stackTokens}
                                                                >
                                                                    <Stack.Item align="start" styles={stackItemStyles} key={item.key.toString() + item.notebookHtml}>
                                                                        {item.notebookHtml}
                                                                    </Stack.Item>
                                                                    <Stack.Item align="end" styles={stackItemEndStyles} key={item.key.toString() + item.notebookName.toString()}>
                                                                        <OverflowSet
                                                                            aria-label="Edit model record"
                                                                            role="menubar"
                                                                            overflowItems={[
                                                                                {
                                                                                    key: item.key.toString(),
                                                                                    value: item.notebookName.toString(),
                                                                                    name: 'Set baseline model',
                                                                                    onClick: updateBaselineModel,
                                                                                },
                                                                                {
                                                                                    key: item.notebookName.toString(),
                                                                                    selected: true,
                                                                                    name: 'Hide from view',
                                                                                    onClick: hideFromView,
                                                                                },
                                                                                {
                                                                                    key: item?.registeredModelName?.toString(),
                                                                                    id: item.key.toString(),
                                                                                    notebookName: item.notebookName.toString(),
                                                                                    name: 'Unregister model',
                                                                                    onClick: unregisterModel,
                                                                                },
                                                                            ]}
                                                                            onRenderOverflowButton={onRenderOverflowButton}
                                                                            onRenderItem={onRenderItem}
                                                                        />
                                                                    </Stack.Item>
                                                                </Stack>
                                                            ) : (
                                                                <Stack
                                                                    horizontal
                                                                    horizontalAlign='center'
                                                                    verticalAlign='center'
                                                                    styles={stackStyles}
                                                                    tokens={stackTokens}
                                                                >
                                                                    <Stack.Item align="start" styles={stackItemStyles}>
                                                                        {item.notebookHtml}
                                                                    </Stack.Item>
                                                                    <Stack.Item align="end" styles={stackItemEndStyles}>
                                                                        <div className="roundedCorners" title="Baseline model">baseline</div>
                                                                    </Stack.Item>
                                                                </Stack>
                                                            )
                                                        }
                                                    </td>
                                                ) : (
                                                    record.firstNotebook === true && record.lastNotebook === false ? (
                                                        <td id="rightBorderTd">
                                                            {
                                                                item.isBaseModel !== true ? (
                                                                    <Stack
                                                                        horizontal
                                                                        horizontalAlign='center'
                                                                        verticalAlign='center'
                                                                        styles={stackStyles}
                                                                        tokens={stackTokens}
                                                                    >
                                                                        <Stack.Item align="start" styles={stackItemStyles} key={item.key.toString() + item.notebookHtml}>
                                                                            {item.notebookHtml}
                                                                        </Stack.Item>
                                                                        <Stack.Item align="end" styles={stackItemEndStyles} key={item.key.toString() + item.notebookName.toString()}>
                                                                            <OverflowSet
                                                                                aria-label="Edit model record"
                                                                                role="menubar"
                                                                                overflowItems={[
                                                                                    {
                                                                                        key: item.key.toString(),
                                                                                        value: item.notebookName.toString(),
                                                                                        name: 'Set baseline model',
                                                                                        onClick: updateBaselineModel,
                                                                                    },
                                                                                    {
                                                                                        key: item.notebookName.toString(),
                                                                                        selected: true,
                                                                                        name: 'Hide from view',
                                                                                        onClick: hideFromView,
                                                                                    },
                                                                                    {
                                                                                        key: item?.registeredModelName?.toString(),
                                                                                        id: item.key.toString(),
                                                                                        notebookName: item.notebookName.toString(),
                                                                                        name: 'Unregister model',
                                                                                        onClick: unregisterModel,
                                                                                    },
                                                                                ]}
                                                                                onRenderOverflowButton={onRenderOverflowButton}
                                                                                onRenderItem={onRenderItem}
                                                                            />
                                                                        </Stack.Item>
                                                                    </Stack>
                                                                ) : (
                                                                    <Stack
                                                                        horizontal
                                                                        horizontalAlign='center'
                                                                        verticalAlign='center'
                                                                        styles={stackStyles}
                                                                        tokens={stackTokens}
                                                                    >
                                                                        <Stack.Item align="start" styles={stackItemStyles}>
                                                                            {item.notebookHtml}
                                                                        </Stack.Item>
                                                                        <Stack.Item align="end" styles={stackItemEndStyles}>
                                                                            <div className="roundedCorners" title="Baseline model">baseline</div>
                                                                        </Stack.Item>
                                                                    </Stack>
                                                                )
                                                            }
                                                        </td>
                                                    ) : (
                                                        record.lastNotebook === true ||
                                                            record.firstNotebook === false && record.lastNotebook === false && item?.metrics[key + 1] && item.metrics[key + 1].metricsVisible === false && item.metrics.length - 1 == key + 1 ? (
                                                            <td id="bottomBordersTd"></td>
                                                        ) : (
                                                            <td id="noBordersTd"></td>
                                                        )
                                                    )
                                                )
                                            }
                                            <td key={record['testDataset'] + record.key + `_` + record.name} >
                                                <Stack
                                                    horizontal
                                                    horizontalAlign='center'
                                                    verticalAlign='center'
                                                    styles={stackStyles}
                                                    tokens={stackTokens}
                                                >
                                                    <Stack.Item align="start" styles={dbStackItemStyles}>
                                                        {record['testDatasetHtml']}
                                                    </Stack.Item>
                                                </Stack>
                                            </td>
                                            {
                                                selectedMetricKeys.map((metric, id) => (
                                                    <td key={metric + `_` + id} className='accuracyFieldValue'>
                                                        <Stack
                                                            horizontal
                                                            horizontalAlign='center'
                                                            verticalAlign="center"
                                                            styles={stackStyles}
                                                            tokens={stackTokens}
                                                        >
                                                            {
                                                                record[metric] !== ERROR_CODE ? (
                                                                    absoluteVisualDisplay === true && toggleVisualDisplay === true ? (
                                                                        <span style={getAbsoluteShading(metric, record[metric], metricHighLow, metricsGlobalHighLow, userColorSelections, resetColorsDefault)}>
                                                                            {record[metric]}
                                                                        </span>
                                                                    ) : (
                                                                        <span>
                                                                            {record[metric]}
                                                                        </span>
                                                                    )
                                                                ) : (
                                                                    <span>
                                                                        -
                                                                    </span>
                                                                )
                                                            }
                                                        </Stack>
                                                    </td>
                                                ))
                                            }
                                        </tr>
                                    ) :
                                        (
                                            //do nothing
                                            console.log()
                                        )
                                ))
                            ) :
                                (
                                    //do nothing
                                    console.log()
                                )
                        ))
                    }
                </tbody>
            </table>
        </>
    );
}