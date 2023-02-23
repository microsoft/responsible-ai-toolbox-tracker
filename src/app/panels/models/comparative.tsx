// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React from 'react';
import { Label } from '@fluentui/react/lib/Label';
import { FontIcon } from '@fluentui/react/lib/Icon';
import { useSelector, useDispatch } from 'react-redux';
import { IButtonProps } from '@fluentui/react/lib/Button';
import { CommandBarButton } from '@fluentui/react/lib/Button';
import { CommandBar, ICommandBarStyles } from '@fluentui/react/lib/CommandBar';
import { DirectionalHint, TooltipHost, ITooltipHostStyles } from '@fluentui/react';
import { IOverflowSetItemProps, OverflowSet } from '@fluentui/react/lib/OverflowSet';
import { Stack, IStackStyles, IStackTokens, IStackItemStyles } from '@fluentui/react/lib/Stack';
import { IContextualMenuItemStyles, IContextualMenuStyles } from '@fluentui/react/lib/ContextualMenu';
import { Utils } from '../../../core/utils';
import { modelsStatsSorted } from './modelsUtils';
import { IColorValuesType } from '../../../core/components';
import { getComparativeShading, comparativeHeatmapData } from './heatmap';

export const Comparative: React.FunctionComponent = (props) => {
    const ERROR_CODE = -99;
    const dispatch = useDispatch();
    const state = useSelector((state) => state);
    const tooltipTestHeader2Id = 'tooltipTestHeader';
    const projectSettings = state['projectSettings'];
    const projectName = projectSettings['name'];
    let datasets = projectSettings['datasets'];
    const notebooks = projectSettings['notebooks'];
    const problemType = projectSettings['problemType'];
    const heatmapColors = projectSettings['heatmapColors'];
    let selectedModels = projectSettings['selectedModels'];
    let selectedMetricKeys = projectSettings['selectedMetrics'];
    let selectedCohorts = projectSettings['selectedCohorts'];
    const baseNotebookModel = projectSettings['baseNotebookModel'];
    const resetColorsDefault = projectSettings['resetColorsDefault'];
    let toggleVisualDisplay = projectSettings['toggleVisualDisplay'];
    let absoluteVisualDisplay = projectSettings['absoluteVisualDisplay'];
    let baselineVisualDisplay = projectSettings['baselineVisualDisplay'];
    const baseNotebookModelKey = projectSettings['baseNotebookModelKey'];
    const tooltipNotebookHeaderId = 'tooltipNotebookHeader';
    const tooltipSortByMetricHeaderId = 'tooltipSortByMetricHeader';
    /**
     * Build and sorting items array.
    */
    let { items, sortItems, sortConfig } = modelsStatsSorted(props.children);
    /**
     * The comparative view colors.
    */
    let userColorSelections = {} as IColorValuesType;
    const setHeatmapColors = () => {
        userColorSelections.comparativeDeclineColor = heatmapColors['comparativeDeclineColor'];
        userColorSelections.comparativeImprovementColor = heatmapColors['comparativeImprovementColor'];
        userColorSelections.absoluteColor = heatmapColors['absoluteColor'];
    }
    setHeatmapColors();
    /**
     * Customize the data for the heatmap feature.
    */
    const [metricsData, baselineData, metricsBoundsDict] = comparativeHeatmapData(items, problemType, selectedCohorts);
    /**
      * Set and update the baseline model settings.
      * @param baseNotebookModel 
      * @param baseNotebookModelKey 
      * @returns 
    */
    const updateBaselineModelSettings = async (baseNotebookModel: string, baseNotebookModelKey: string, _utils: Utils = undefined) => {
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
        const _utils = new Utils();
        if (item) {
            dispatch({ type: 'UPDATE_COMPARE_MODEL_VIEW', payload: projectSettings });
            updateBaselineModelSettings(item.value, item.key, _utils);
        }
    };
    /**
     * 
     * @returns 
    */
    const updateSelectedModels = async () => {
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
    };
    /**
     * Update he unregister models settings.
     * @param notebookKey 
     * @param notebookName 
     * @returns 
    */
    const unregisterModelSettings = async (notebookKey: string, notebookName: string, _utils: Utils = undefined) => {
        return _utils.UnregisterModelSettings(projectSettings, notebookKey, notebookName)
            .then(response => {
                return response;
            })
            .catch((error: Error) => {
                return false;
            });
    }

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
     * 
     * @param notebookName 
     * @param _utils 
     * @returns 
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
     * @param event 
     * @param item 
    */
    const unregisterModel = async (event: React.FormEvent<CommandBarButton>, item: IOverflowSetItemProps): Promise<void> => {
        if (item) {
            const _utils = new Utils();
            /**
             * Identify the resources that should be delete it.
            */
            let resources = await _utils.identifyResources(notebooks, item.notebookName);
            /**
             * Delete the notebook resources.
            */
            const success = await _utils.deleteNotebookResources(projectSettings.name, resources, item.notebookPath, true);
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
                }).catch((error: Error) => {
                    console.log("Unregister model update error: " + error.message);
                });
            } else {
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
            verticalAlign: 'center',
            height: '10px',
            width: '100%'
        },
    };

    const baselineStackStyles: IStackStyles = {
        root: {
            alignItems: 'center',
            borderBottom: '5px solid #eee'
        },
    };

    const stackStyles: IStackStyles = {
        root: {
            alignItems: 'center'
        },
    };
    const stackTokens = { childrenGap: 0 };
    const stackTokensMetrics = { childrenGap: 0 };
    const datasetStackItemStyles: IStackItemStyles = {
        root: {
            paddingLeft: 5,
            width: 150,
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
    const stackItemEndAllStyles: IStackItemStyles = {
        root: {
            width: 20,
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
    const saveCompareToSettings = async () => {
        const _utils = new Utils();
        return _utils.UpdateBaseProjectSettings(projectSettings)
            .then(response => {
                return response;
            })
            .catch((error: Error) => {
                return null;
            });
    }
    const CompareToBaseline = (event: React.FormEvent<CommandBarButton>, item: IOverflowSetItemProps) => {
        for (let i = 0; i < notebooks.length; i++) {
            if (!notebooks[i].isBaseModel) {
                if (notebooks[i].name === item.notebookName) {
                    for (let j = 0; j < notebooks[i].metrics.length; j++) {
                        if (notebooks[i].metrics[j].name === item.compareText)
                            notebooks[i].metrics[j].mapTo = item.text;
                    }
                }
            }
        }
        projectSettings['notebooks'] = notebooks
        saveCompareToSettings().then(content => {
            if (content) {
                //todo: fix "nothing for now".
                dispatch({ type: 'UPDATE_COMPARE_MODEL_VIEW', payload: projectSettings });
            }
        });
    };
    const noOp = () => undefined;
    /**
     * Build the cohort overflow set.
     * @param items 
     * @param item 
     * @param record 
     * @returns 
    */
    const getOverflowItems = (items: any, record: any): any => {

        let flowItemsArr = [];
        let flowItem = {};
        flowItem =
        {
            key: 'disabled',
            text: 'map to a baseline cohort',
            disabled: true,
            onClick: noOp
        }
        flowItemsArr.push(flowItem);
        flowItem = {};
        for (let i in items) {
            const item = items[i];
            if (item.isBaseModel) {
                const records = item.metrics;
                for (let j in records) {
                    const masterRecord = records[j];
                    /**
                     * If the baseline record is a cohort, and if it has the same master dataset 
                     * as the overflowSet record, add this cohort to the compare list.
                    */
                    if (masterRecord.isCohort && masterRecord.cohortMaster === record.cohortMaster) {
                        flowItem =
                        {
                            key: masterRecord.key.toString(),
                            text: masterRecord.testDataset,
                            compareKey: record.key.toString(),
                            compareText: record.testDataset,
                            notebookName: record.notebookName,
                            onClick: CompareToBaseline
                        }
                        flowItemsArr.push(flowItem);
                        flowItem = {};
                    }
                }
            }
        }
        return flowItemsArr;
    }
    const stackCommandItemStyles: IStackItemStyles = {
        root: {
            paddingLeft: 0,
            width: 'auto',
            height: 'auto',
            alignItems: 'left',
            alignContent: 'left',
            textAlign: 'left',
        },
    };
    const itemStyles: Partial<IContextualMenuItemStyles> = {
        label: { fontSize: 14 },
    };
    const menuStyles: Partial<IContextualMenuStyles> = {
        subComponentStyles: { menuItem: itemStyles, callout: {} },
    };
    const overflowProps: IButtonProps = {
        ariaLabel: 'More commands',
        menuProps: {
            styles: menuStyles,
            items: [],
        },
    };
    const commandBarStyles: ICommandBarStyles = {
        root: {
            width: '10px',
            height: '18px',
            alignContent: 'right',
            paddingRight: '35px',
        },
    };
    return (
        <>
            <table className='modelsTable'>
                <thead>
                    <tr key="comparativeModelsHeaders">
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
                                <th key={metric + `_` + key}>
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
                                        toggleVisualDisplay === true && baselineVisualDisplay === true ? (
                                            <>
                                                <Stack
                                                    horizontal={true}
                                                    horizontalAlign='center'
                                                    verticalAlign='end'
                                                    styles={headerStyles}
                                                    tokens={headerStackTokens}
                                                >
                                                    <Stack.Item className="metricLegend">
                                                        <span>-{metricsBoundsDict[metric].maxDelta}</span>
                                                    </Stack.Item>
                                                    {
                                                        metric === 'Log Loss' || metric === 'mse' || metric === 'rmse' || metric === 'mae' ? (
                                                            <Stack.Item className="_comparativeMetricLegend">
                                                                <div title={metric}>&nbsp;</div>
                                                            </Stack.Item>
                                                        ) : (

                                                            <Stack.Item className="comparativeMetricLegend">
                                                                <div title={metric}>&nbsp;</div>
                                                            </Stack.Item>
                                                        )
                                                    }
                                                    <Stack.Item className="metricLegend">
                                                        <span>{metricsBoundsDict[metric].maxDelta}</span>
                                                    </Stack.Item>
                                                </Stack>
                                            </>
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
                                        <tr key={record.key + `_` + item.key + `_` + item.name}>
                                            {
                                                record.firstNotebook === true && record.lastNotebook === true ||
                                                    record.firstNotebook === true && record.lastNotebook === false && item.rowspan === 1 ? (
                                                    <td id="">
                                                        {
                                                            item.isBaseModel !== true ? (
                                                                <Stack
                                                                    horizontal
                                                                    horizontalAlign='start'
                                                                    verticalAlign='center'
                                                                    styles={stackStyles}
                                                                    tokens={stackTokens}
                                                                >
                                                                    <Stack.Item align="start" styles={stackItemStyles} key={item.notebookHtml + item.key.toString()}>
                                                                        {item.notebookHtml}
                                                                    </Stack.Item>
                                                                    <Stack.Item align="end" styles={stackItemEndStyles} key={item.notebookName.toString() + item.key.toString()}>
                                                                        <OverflowSet
                                                                            aria-label="Edit model record"
                                                                            role="menubar"
                                                                            overflowItems={[
                                                                                {
                                                                                    key: item.key.toString(),
                                                                                    value: item.notebookName.toString(),
                                                                                    selected: true,
                                                                                    name: 'Set baseline model',
                                                                                    onClick: updateBaselineModel,
                                                                                },
                                                                                {
                                                                                    key: item.notebookName.toString(),
                                                                                    selected: false,
                                                                                    name: 'Hide from view',
                                                                                    onClick: hideFromView,
                                                                                },
                                                                                {
                                                                                    key: item?.registeredModelName?.toString(),
                                                                                    id: item.key.toString(),
                                                                                    notebookName: item.notebookName.toString(),
                                                                                    name: 'Unregister model',
                                                                                    selected: false,
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
                                                                    horizontalAlign='start'
                                                                    verticalAlign='center'
                                                                    styles={stackStyles}
                                                                    tokens={stackTokens}
                                                                >
                                                                    <Stack.Item align="start" styles={stackItemStyles} >
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
                                                                        horizontalAlign='start'
                                                                        verticalAlign='center'
                                                                        styles={stackStyles}
                                                                        tokens={stackTokens}
                                                                    >
                                                                        <Stack.Item align="start" styles={stackItemStyles} key={item.notebookHtml + item.key.toString()}>
                                                                            {item.notebookHtml}
                                                                        </Stack.Item>
                                                                        <Stack.Item align="end" styles={stackItemEndStyles} key={item.notebookName.toString() + item.key.toString()}>
                                                                            <OverflowSet
                                                                                aria-label="Edit model record"
                                                                                role="menubar"
                                                                                overflowItems={[
                                                                                    {
                                                                                        key: item.key.toString(),
                                                                                        value: item.notebookName.toString(),
                                                                                        selected: true,
                                                                                        name: 'Set baseline model',
                                                                                        onClick: updateBaselineModel,
                                                                                    },
                                                                                    {
                                                                                        key: item.notebookName.toString(),
                                                                                        selected: false,
                                                                                        name: 'Hide from view',
                                                                                        onClick: hideFromView,
                                                                                    },
                                                                                    {
                                                                                        key: item?.registeredModelName?.toString(),
                                                                                        id: item.key.toString(),
                                                                                        notebookName: item.notebookName.toString(),
                                                                                        notebookPath: item.path.toString(),
                                                                                        name: 'Unregister model',
                                                                                        selected: false,
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
                                                                        horizontalAlign='start'
                                                                        verticalAlign='center'
                                                                        styles={stackStyles}
                                                                        tokens={stackTokens}
                                                                    >
                                                                        <Stack.Item align="start" styles={stackItemStyles} >
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
                                            <td key={record.key + `_` + record.name + record['testDataset']} >
                                                {
                                                    item.isBaseModel === false ? (
                                                        <Stack
                                                            horizontal
                                                            horizontalAlign='start'
                                                            verticalAlign='center'
                                                            styles={stackStyles}
                                                            tokens={stackTokens}
                                                        >
                                                            {
                                                                record['isCohort'] === false ?
                                                                    (
                                                                        <Stack.Item align="center" styles={stackItemEndAllStyles}>
                                                                            <div className="roundedCornersAll" title="All dataset">All</div>
                                                                        </Stack.Item>
                                                                    ) : (<div className="spaceStyle">&nbsp;</div>)
                                                            }
                                                            <Stack.Item align="start" styles={datasetStackItemStyles}>
                                                                {record['testDatasetHtml']}
                                                            </Stack.Item>
                                                            {
                                                                record['isCohort'] === true ?
                                                                    (
                                                                        <Stack.Item align="start" styles={stackCommandItemStyles}>
                                                                            <CommandBar
                                                                                styles={commandBarStyles}
                                                                                items={undefined}
                                                                                overflowItems={getOverflowItems(items, record)}
                                                                                overflowButtonProps={overflowProps}
                                                                            />
                                                                        </Stack.Item>

                                                                    ) : (console.log())
                                                            }
                                                        </Stack>
                                                    ) : (
                                                        <Stack
                                                            horizontal
                                                            horizontalAlign='start'
                                                            verticalAlign='center'
                                                            styles={stackStyles}
                                                            tokens={stackTokens}
                                                        >
                                                            {
                                                                item.isBaseModel === true && record['isCohort'] === false ?
                                                                    (
                                                                        <Stack.Item align="center" styles={stackItemEndAllStyles}>
                                                                            <div className="roundedCornersAll" title="All dataset">All</div>
                                                                        </Stack.Item>
                                                                    ) : (<div className="spaceStyle">&nbsp;</div>)
                                                            }
                                                            <Stack.Item align="start" styles={datasetStackItemStyles}>
                                                                {record['testDatasetHtml']}
                                                            </Stack.Item>

                                                        </Stack>
                                                    )
                                                }
                                            </td>
                                            {
                                                selectedMetricKeys.map((metric, id) => (
                                                    <td key={id + `_` + metric} className='accuracyFieldValue'>
                                                        <Stack
                                                            horizontal
                                                            horizontalAlign='center'
                                                            verticalAlign="center"
                                                            styles={stackStyles}
                                                            tokens={stackTokensMetrics}
                                                        >
                                                            {
                                                                record[metric] !== ERROR_CODE ? (
                                                                    toggleVisualDisplay === true && baselineVisualDisplay === true && item.isBaseModel !== true ? (
                                                                        getComparativeShading(metric, record[metric], metricsData, baselineData, metricsBoundsDict, record, true, userColorSelections, resetColorsDefault)
                                                                    ) : (
                                                                        item.isBaseModel !== true ? (
                                                                            getComparativeShading(metric, record[metric], metricsData, baselineData, metricsBoundsDict, record, false, userColorSelections, resetColorsDefault)
                                                                        ) : (
                                                                            <span>
                                                                                {record[metric]}
                                                                            </span>
                                                                        )
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