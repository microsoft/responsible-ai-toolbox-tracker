// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React from 'react';
import { useState, useMemo } from 'react';
import { PathExt } from '@jupyterlab/coreutils';
import { TooltipHost, ITooltipHostStyles } from '@fluentui/react';
import { DropdownMenuItemType, IDropdownOption } from '@fluentui/react/lib/Dropdown';
import { INotebookMetricsType } from '../../../core/components';
import _ from 'lodash';
/**
 * 
 * @param metric 
 * @returns 
*/
export const trimDisplayMetric = (metric: number, metricLength: number = 3) => {
    return Number(metric.toFixed(metricLength));
}
/**
 * 
 * @param displayStr 
 * @param length 
 * @returns 
*/
const nbNameDisplay = (nbName: string, nbLength: number) => {
    if (nbName?.length < nbLength) { return nbName; }
    const ext = PathExt.extname(nbName);
    let name = PathExt.basename(nbName, ext);
    let displayName = name.substring(0, nbLength);
    displayName = displayName.concat('..', ext);
    return displayName;
}

/**
 * Dataset mapping to cohort.
 * @param datasetList 
 * @returns 
*/
export const isDatasetCohort = (datasetList: any) => {
    let cohortDataset = {};
    let cohortMaster = {};
    for (let i = 0; i < datasetList.length; i++) {
        let datasetRecord = datasetList[i];
        if (datasetRecord.isCohort === true) {
            cohortDataset[datasetRecord.name] = true;
            cohortMaster[datasetRecord.name] = datasetRecord.masterName;
        } else {
            cohortDataset[datasetRecord.name] = false;
        }
    }
    return [cohortDataset, cohortMaster];
}
/**
 * Set the default baseline meta data correctly.
 * @param notebookList 
 * @param baseNotebookModelKey 
 * @returns 
*/
const setBaselineDefault = (notebookList: any, baseNotebookModelKey: string): any => {
    let baseIsSet = false;
    for (let i in notebookList) {
        if (notebookList[i].key === baseNotebookModelKey) {
            notebookList[i]['isBaseModel'] = true;
            baseIsSet = true;
        } else {
            notebookList[i]['isBaseModel'] = false;
        }
    }
    if (!baseIsSet) {
        for (let i in notebookList) {
            if (notebookList[i]?.registeredModel.length > 0) {
                notebookList[i]['isBaseModel'] = true;
                break;
            } else {
                notebookList[i]['isBaseModel'] = false;
            }
        }
    }
    return notebookList;
}
/**
 * Retrieve models data.
 * @param datasetList 
 * @param notebookList 
 * @param baseNotebookModelKey 
 * @returns 
*/
export const getModelsStats = (datasetList: any, notebookList: any, baseNotebookModelKey: string, selectedModels: string[] = undefined): [any[], IDropdownOption[], IDropdownOption[], IDropdownOption[]] => {
    const NOTEBOOK_DISPLAY = 15;
    const METRICS_ROUND_NUM = 3;
    const TEST_DATASET_DISPLAY = 15;
    const hostStyles: Partial<ITooltipHostStyles> = { root: { display: 'inline-block', alignContent: 'left' } };
    const calloutProps = { gapSpace: 0 };
    let HIGH: number = 0;
    let LOW: number = Number.MAX_SAFE_INTEGER;
    let metricHeaders: IDropdownOption[] = [];
    let cohortOptions: IDropdownOption[] = [];
    let notebookOptions: IDropdownOption[] = [];
    let modelStats_arr = [];
    let modelStatsList = {};
    /**
     * Build the cohort options.
    */
    for (let i = 0; i < datasetList.length; i++) {
        let datasetRecord = datasetList[i];
        cohortOptions.push({ key: datasetRecord.name, text: datasetRecord.name, selected: true, disabled: false });
    }
    let [datasetCohort, cohortMaster] = isDatasetCohort(datasetList);
    /**
     *  Build the cohort options footer.
    */
    cohortOptions.push({ key: 'divider_1', text: '-', itemType: DropdownMenuItemType.Divider });
    cohortOptions.push({ key: 'Add new cohort', text: 'Add new cohort', data: { icon: 'CirclePlus' }, selected: false, itemType: DropdownMenuItemType.Header });
    /**
     * Make sure default baseline info are set correctly.
    */
    notebookList = setBaselineDefault(notebookList, baseNotebookModelKey);

    for (let i = 0; i < notebookList.length; i++) {
        let tooltipId = 'tooltip1' + i.toString();
        let tooltip2Id = 'tooltip2' + i.toString();
        let notebookRecord = notebookList[i];
        modelStatsList['id'] = i + 1;
        modelStatsList['key'] = notebookRecord.key;
        modelStatsList['notebookName'] = notebookRecord.name;
        modelStatsList['rowspan'] = 0;
        modelStatsList['notebookVisible'] = notebookRecord.notebookVisible;

        modelStatsList['isBaseModel'] = notebookRecord.isBaseModel;
        modelStatsList['path'] = notebookRecord.path;
        let modelDisplayName = notebookRecord.name;
        if (modelDisplayName.length > NOTEBOOK_DISPLAY) {
            modelDisplayName = nbNameDisplay(modelDisplayName, NOTEBOOK_DISPLAY);
        }
        let testDatasetDisplayName = notebookRecord.testDataset;

        if (testDatasetDisplayName && testDatasetDisplayName.length > TEST_DATASET_DISPLAY) {
            testDatasetDisplayName = nbNameDisplay(testDatasetDisplayName, TEST_DATASET_DISPLAY);
        }

        modelStatsList['notebookName'] = notebookRecord.name;
        modelStatsList['notebookHtml'] =
            <TooltipHost content={notebookRecord.name} id={tooltipId} calloutProps={calloutProps} styles={hostStyles}>
                {modelDisplayName}
            </TooltipHost>
        // define the registered models visibility in the compare models views.
        if (notebookRecord.registeredModel && notebookRecord.registeredModel.length > 0) {

            if (notebookRecord.key === baseNotebookModelKey) {
                notebookOptions.push({ key: notebookRecord.name, text: notebookRecord.name, selected: true, disabled: true });
            } else {
                if (selectedModels !== undefined && selectedModels.indexOf(notebookRecord.name) !== -1) {
                    notebookOptions.push({ key: notebookRecord.name, text: notebookRecord.name, selected: true, disabled: false });
                    notebookRecord.notebookVisible = true;
                }
                else {
                    notebookRecord.notebookVisible = false;
                    notebookOptions.push({ key: notebookRecord.name, text: notebookRecord.name, selected: false, disabled: false });
                }
                modelStatsList['notebookVisible'] = notebookRecord.notebookVisible;

            }
            modelStatsList['registeredModel'] = true;
            modelStatsList['registeredModelName'] = notebookRecord.registeredModel;
            modelStatsList['mlPlatform'] = notebookRecord.mlPlatform;
            modelStatsList['testDataset'] = notebookRecord.testDataset;
            modelStatsList['testDatasetHtml'] =
                <TooltipHost content={notebookRecord.testDataset} id={tooltip2Id} calloutProps={calloutProps} styles={hostStyles}>
                    {testDatasetDisplayName}
                </TooltipHost>
        }
        let metrics = notebookRecord.metrics;
        let notebook_metrics = {};
        let notebookMetricsArr: any[] = [];
        let first = true;
        for (let k in metrics) {
            let v = metrics[k];
            notebook_metrics['key'] = v.key;
            notebook_metrics['testDataset'] = v.name;
            notebook_metrics['metricsVisible'] = v.metricsVisible;
            notebook_metrics['mapTo'] = v.mapTo; 
            notebook_metrics['isCohort'] = datasetCohort[v.name];
            notebook_metrics['cohortMaster'] = cohortMaster[v.name];
            if (v.metricsVisible) {
                modelStatsList['rowspan'] = modelStatsList['rowspan'] + 1;
                if (first === true) {
                    notebook_metrics['firstNotebook'] = true;
                    first = false;
                } else {
                    notebook_metrics['firstNotebook'] = false;
                }
                if (k === (metrics.length - 1).toString() && notebookRecord.key === baseNotebookModelKey) {
                    notebook_metrics['baselineSeparator'] = 'baselineSeparator';
                } else {
                    notebook_metrics['baselineSeparator'] = '';
                }
                if (k === (metrics.length - 1).toString()) {
                    notebook_metrics['lastNotebook'] = true;
                } else {
                    notebook_metrics['lastNotebook'] = false;
                }
            }
            notebook_metrics['notebookName'] = notebookRecord.name;
            let testDataDisplay = v.name;
            if (testDataDisplay && testDataDisplay.length > TEST_DATASET_DISPLAY) {
                testDataDisplay = nbNameDisplay(testDataDisplay, TEST_DATASET_DISPLAY);
            }
            notebook_metrics['testDatasetHtml'] =
                <TooltipHost content={v.name} id={tooltip2Id} calloutProps={calloutProps} styles={hostStyles}>
                    {testDataDisplay}
                </TooltipHost>
            for (let m in v.metrics) {
                let acc = v.metrics[m];
                notebook_metrics[acc.key] = trimDisplayMetric(acc.value, METRICS_ROUND_NUM);
                /**
                 * Set the HIGH and LOW for heatmap 
                 */
                if (acc.value > HIGH) { HIGH = acc.value }
                if (acc.value < LOW) { LOW = acc.value }
            }
            notebookMetricsArr.push(notebook_metrics);
            notebook_metrics = {} as INotebookMetricsType;
        }
        modelStatsList["metrics"] = notebookMetricsArr;
        notebookMetricsArr = [];
        /**
         * build the metric headers
        */
        let longestLength = 0;
        if (metricHeaders.length === 0) {
            for (let k in metrics) {
                let v = metrics[k];
                /**
                 * Identify the entity with the highest number of metrics
                 */
                if (v.metrics.length > longestLength) {
                    metricHeaders = [];
                    for (let m in v.metrics) {
                        let item = v.metrics[m];
                        metricHeaders.push({ key: item.key, text: item.key, selected: false, disabled: false });
                    }
                    longestLength = v.length;
                }
            }
        }
        modelStatsList['mlFlowRunId'] = notebookRecord.mlFlowRunId;
        modelStats_arr.push(modelStatsList);
        modelStatsList = {};
    }
    return [modelStats_arr, metricHeaders, cohortOptions, notebookOptions];
}
/**
 * Adjust the first notebook value for each grouping.
 * @param items 
 * @returns 
*/
const adjustFirstNotebook = (items: any) => {
    for (let i in items) {
        let first = true;
        let _items = items[i];
        for (let j in _items.metrics) {
            let record = _items.metrics[j];
            if (record.metricsVisible) {
                if (first === true) {
                    _items.metrics[j].firstNotebook = true;
                    first = false;
                } else {
                    _items.metrics[j].firstNotebook = false;
                }
                if (j === (_items.metrics.length - 1).toString() && _items.isBaseModel) {
                    _items.metrics[j].baselineSeparator = 'baselineSeparator';
                } else {
                    _items.metrics[j].baselineSeparator = '';
                }
            }
        }
    }
    return items;
}
/**
 * 
 * @param items 
 * @returns 
*/
const preserveBaselineTop = (items: any) => {
    let baselineItems = [];
    let _items = [];
    for (let i in items) {
        if (items[i].isBaseModel) {
            baselineItems.push(items[i]);
        }
        else {
            _items.push(items[i]);
        }
    }
    /**
     * Merge the two data objects.
    */
    for (let i in _items) {
        baselineItems.push(_items[i]);
    }
    return adjustFirstNotebook(baselineItems);
}
/**
 * Sort models UI list.
 * @param dataItems 
 * @param config 
 * @returns 
*/
export const modelsStatsSorted = (dataItems, config = null) => {
    const [sortConfig, setSortConfig] = useState(config);
    const sortedItems = useMemo(() => {
        let sortableItems = [...dataItems];
        if (sortConfig !== null) {
            if (sortConfig.key !== 'notebookName') {
                for (let i in sortableItems) {
                    const _ordered = _.orderBy(sortableItems[i].metrics, sortConfig.key, sortConfig.direction);
                    sortableItems[i].metrics = _ordered;
                }
            }
            else {
                const _ordered = _.orderBy(sortableItems, sortConfig.key, sortConfig.direction);
                sortableItems = _ordered;
            }
        }
        return sortableItems;
    }, [dataItems, sortConfig]);
    const sortItems = (key:any) => {
        let direction = 'asc';
        if (
            sortConfig &&
            sortConfig.key === key &&
            sortConfig.direction === 'asc'
        ) {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };
    /**
     * Preserve the baseline at the top.
    */
    const _items = preserveBaselineTop(sortedItems);
    return { items: _items, sortItems, sortConfig };
}
/**
 * Get random integer.
 * @param min 
 * @param max 
 * @returns random int - min & max inclusive 
*/
export const getRandomNumber = (): Number => {
    const min = Math.ceil(Number.MIN_SAFE_INTEGER);
    const max = Math.floor(Number.MAX_SAFE_INTEGER);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


