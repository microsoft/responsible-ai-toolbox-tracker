// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React from 'react';
import { FontIcon, Icon } from '@fluentui/react/lib/Icon';
import { trimDisplayMetric } from './modelsUtils';
import { IColorValuesType } from '../../../core/components';
import {
    ICompareMetricBounds,
    ICompareMetricsBounds,
    classificationMetrics,
    comparativeClassificationMetrics,
    comparativeRegressionMetrics,
    regressionMetrics
} from './modelTypes';
/**
 * Convert RGB to Hex.
 * @param r 
 * @param g 
 * @param b 
 * @returns 
*/
const rgbToHex = (r, g, b) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
/**
 * 
 * @param hex 
 * @returns 
*/
const hexToRgbA = (hex: any) => {
    var c;
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
        c = hex.substring(1).split('');
        if (c.length == 3) {
            c = [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c = '0x' + c.join('');
        return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',1)';
    }
    throw new Error('Bad Hex');
}
/**
 * 
 * @param num 
 * @param _metricData 
 * @param _cohortMetric 
 * @param _baselineData 
 * @param _cohortBaseline 
 * @returns 
*/
const getCompareNum = (num: number, mapToName: string, _metricData: any, _cohortMetrics: any, _baselineData: any, _cohortBaseline: any, _masterDatasets: any, _baselineMasterDatasets: any, mapTo: any, baselineDatasets: any) => {
    const numIndex = _metricData.indexOf(num);
    const isCohort = _cohortMetrics[numIndex];
    const ERROR_CODE = -99;
    /**
     * default cohort mapping.
     */
    if (mapToName && mapToName !== "" && mapToName.length > 0) {
        const mapToIndex = baselineDatasets.indexOf(mapToName);
        if (mapToIndex !== -1) {
            return _baselineData[mapToIndex];
        }
        else {
            return ERROR_CODE;
        }
    }
    /**
     * Loop through the baseline datasets, identify the mapTo value. 
    */
    for (let i in baselineDatasets) {
        const v = baselineDatasets[i];
        if (_cohortBaseline[i] === isCohort) {
            if (mapTo && mapTo[i]) {
                const mapToIndex = baselineDatasets.indexOf(mapToName);
                if (mapToIndex !== -1) {
                    return _baselineData[mapToIndex];
                }
                // else do nothing.  The second loop will identify the default.
            }
        }
    }
    /**
     * If mapTo is not set, grab the first baseline cohort to compare to.
    */
    for (let i in _baselineData) {
        const v = _baselineData[i];
        if (_cohortBaseline[i] === isCohort) {
            if (compareToCohort(num, _metricData, _cohortMetrics, _masterDatasets, _baselineMasterDatasets)) {
                return v;
            }
        }
    }
    return ERROR_CODE;
}
/**
 * Return true if its finds a baseline cohort with the same master dataset. otherwise false.
 * Identify the cohort to compare to.
 * @param num 
 * @param _metricData 
 * @param _cohortMetric 
 * @param _masterDatasets 
 * @param _baselineMasterDatasets 
 * @returns 
 */
const compareToCohort = (num: number, _metricData: any, _cohortMetrics: any, _masterDatasets: any, _baselineMasterDatasets) => {
    const numIndex = _metricData.indexOf(num);
    const isCohort = _cohortMetrics[numIndex];
    const baselineMaster = _baselineMasterDatasets[0];
    const cohortMaster = _masterDatasets[numIndex];

    if (!isCohort) { return true; }
    else if (isCohort && baselineMaster === cohortMaster) { return true; }
    return false;
}
/**
 * Round Dec tool
 * @param num 
 * @param f 
 * @returns 
*/
const roundDec = (num: number, f: number): number => {
    return Number(num.toFixed(f));
}
/**
 * Takes an accuracy value and returns a color shade 
 * @param num Accuracy value
 * @returns red, green, and blue values
*/
const mapColorToScale = (normNum: number, lightColor: number[], darkColor: number[]) => {
    /**
     * Multiply the normalized probability by the dark color rgb values.
    */
    let vector = darkColor.map(function (c, i) {
        return normNum * darkColor[i];
    });

    /**
     * Multiply the normalized probability by the light color rgb values, and add them to the vector
    */
    let c = vector.map(function (v, i) {
        return v + Math.abs((1 - normNum)) * lightColor[i];
    });

    const r = Math.round(c[0]);
    const g = Math.round(c[1]);
    const b = Math.round(c[2]);

    return [r, g, b];
}
const normalizeNum = (num: number, minRange: number, maxRange: number, minVal: number, maxVal: number) => {
    return (((num - minVal) / (maxVal - minVal)) * (maxRange - minRange) + minRange);
}
/**
 * 
 * @param percent 
 * @param red 
 * @param green 
 * @param blue 
 * @returns 
*/
const colorShade = (percent: any, red: any, green: any, blue: any) => {
    let n = percent < 0;
    let t = n ? 0 : percent * 255 ** 2;
    let P = n ? 1 + percent : 1 - percent;
    let rr = Math.round((P * red ** 2 + t) ** 0.5);
    let gg = Math.round((P * green ** 2 + t) ** 0.5);
    let bb = Math.round((P * blue ** 2 + t) ** 0.5);
    return [rr, gg, bb];
}
/**
 * 
 * @returns 
*/
const defaultHeatmapColors = (): IColorValuesType => {
    let defaultColors = {} as IColorValuesType;
    defaultColors.comparativeDefaultDeclineLower = [255, 192, 198];
    defaultColors.comparativeDefaultDeclineUpper = [252, 88, 102];
    defaultColors.comparativeDefaultImprovementLower = [206, 229, 176];
    defaultColors.comparativeDefaultImprovementUpper = [97, 163, 11];
    defaultColors.absoluteDefaultLower = [223, 237, 255];
    defaultColors.absoluteDefaultUpper = [70, 147, 253];
    return defaultColors;
}
/**
 * Calculate the color shade according to the accuracy value
 * @param num the accuracy value
 * @returns a background color
*/
export const getAbsoluteShading = (metric: string, num: number, metricHighLow: any, metricsGlobalHighLow: any, userColorSelections: IColorValuesType, resetColorsDefault: boolean = false): any => {
    /**
     * Get the min and max number for the metric values.
    */
    let min: number;
    let max: number;
    let globalMin: number;
    let globalMax: number;
    if (metric === 'Log Loss' || metric === 'mse' || metric === 'rmse' || metric === 'mae') {
        min = metricHighLow[metric][1];
        max = metricHighLow[metric][0];
        globalMin = metricsGlobalHighLow[1];
        globalMax = metricsGlobalHighLow[0];
    }
    else {
        min = metricHighLow[metric][0];
        max = metricHighLow[metric][1];
        globalMin = metricsGlobalHighLow[0];
        globalMax = metricsGlobalHighLow[1];
    }
    /**
     * Color options.
    */
    let lowShade = [];
    let highShade = [];
    let defaultColors = defaultHeatmapColors();
    if (resetColorsDefault) {
        lowShade = defaultColors.absoluteDefaultLower; // #ffc0be
        highShade = defaultColors.absoluteDefaultUpper; // #fc5866
    } else {
        let lP = 0.4;
        let hP = -0.4;
        let [red, green, blue] = userColorSelections.absoluteColor.split(",");
        lowShade = colorShade(lP, red, green, blue);
        highShade = colorShade(hP, red, green, blue);
        if (!lowShade || !highShade) {
            lowShade = defaultColors.absoluteDefaultLower; // #ffc0be
            highShade = defaultColors.absoluteDefaultUpper; // #fc5866
        }
    }
    let normNum = ((num - min) / (max - min));
    normNum = normNum / 1.01;
    const [r, g, b] = mapColorToScale(normNum, lowShade, highShade);
    const hexColor = rgbToHex(r, g, b);
    return {
        backgroundColor: hexColor,
    };
}
const getStandardDeviation = (array: number[]) => {
    const n = array.length;
    const mean = array.reduce((a: number, b: number) => a + b) / n;
    return Math.sqrt(array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n);
}
/**
 * Calculate the color shade according to the accuracy value
 * @param num the accuracy value
 * @returns a background color
*/
export const getComparativeShading = (metric: string, num: number, metricsData: any, baselineData: any, metricsBoundsDict: ICompareMetricsBounds, record: any, isVisual: boolean = true, userColorSelections: IColorValuesType, resetColorsDefault: boolean = false): any => {
    /**
     * Instantiate local objects.
    */
    const ERROR_CODE = -99;
    let lightDecline = [];
    let darkDecline = [];
    let lightImprove = [];
    let darkImprove = [];

    let defaultColors = defaultHeatmapColors();
    if (resetColorsDefault) {
        lightDecline = defaultColors.comparativeDefaultDeclineLower; // #ffc0be
        darkDecline = defaultColors.comparativeDefaultDeclineUpper; // #fc5866
        lightImprove = defaultColors.comparativeDefaultImprovementLower; // #cee5b0
        darkImprove = defaultColors.comparativeDefaultImprovementUpper; // #61a30b
    } else {
        let lP = 0.4;
        let hP = -0.4;
        let [iRed, iGreen, iBlue] = userColorSelections.comparativeImprovementColor.split(",");
        lightImprove = colorShade(lP, iRed, iGreen, iBlue);
        darkImprove = colorShade(hP, iRed, iGreen, iBlue);

        let [dRed, dGreen, dBlue] = userColorSelections.comparativeDeclineColor.split(",");
        lightDecline = colorShade(lP, dRed, dGreen, dBlue);
        darkDecline = colorShade(hP, dRed, dGreen, dBlue);

        if (!lightDecline || !darkDecline || !lightImprove || !darkImprove) {
            lightDecline = defaultColors.comparativeDefaultDeclineLower; // #ffc0be
            darkDecline = defaultColors.comparativeDefaultDeclineUpper; // #fc5866
            lightImprove = defaultColors.comparativeDefaultImprovementLower; // #cee5b0
            darkImprove = defaultColors.comparativeDefaultImprovementUpper; // #61a30b
        }
    }
    const _metricData = metricsData[metric];
    const _cohortMetrics = metricsData['isCohort'];
    const _masterDatasets = metricsData['masterDatasets'];
    const _baselineData = baselineData[metric];
    const _cohortBaseline = baselineData['isCohort'];
    const baselineDatasets = baselineData['datasetNames'];
    const _mapTo = metricsData['mapTo'];
    const _baselineMasterDatasets = baselineData['masterDatasets'];
    let minDelta = metricsBoundsDict[metric].minDelta;
    let maxDelta = metricsBoundsDict[metric].maxDelta;
    const compareNum = getCompareNum(num, record.mapTo, _metricData, _cohortMetrics, _baselineData, _cohortBaseline, _masterDatasets, _baselineMasterDatasets, _mapTo, baselineDatasets);
    let lowShade = [];
    let highShade = [];
    /**
     * special case the log loss.
    */
    if (metric === 'Log Loss' || metric === 'mse' || metric === 'rmse' || metric === 'mae') {
        if (num < compareNum) {
            lowShade = lightImprove;
            highShade = darkImprove;
        } else {
            lowShade = lightDecline;
            highShade = darkDecline;
        }
    }
    else {
        if (num < compareNum) {
            lowShade = lightDecline;
            highShade = darkDecline;

        } else {
            lowShade = lightImprove;
            highShade = darkImprove;
        }
    }
    let deltaNum = Math.abs(num - compareNum);
    let [red, green, blue]: any[] = [];
    let shadedColor: any[] = [];
    let numPercent = Math.abs(1 - Math.abs(num - compareNum) / maxDelta);
    // /**
    //  * allowed % of the max value to smooth the edges.
    // */
    // if (numPercent > 0.98) {
    //     numPercent = 0.98;
    // } else if (numPercent > 0.96) {
    //     numPercent = 0.96;
    // } else if (numPercent > 0.94) {
    //     numPercent = 0.94;
    // }
    if (metric === 'Log Loss' || metric === 'mse' || metric === 'rmse' || metric === 'mae') {
        if (num < compareNum) {
            [red, green, blue] = darkImprove;
            shadedColor = colorShade(numPercent, red, green, blue);
        } else {
            [red, green, blue] = darkDecline;
            shadedColor = colorShade(numPercent, red, green, blue);
        }
    }
    else {
        if (num < compareNum) {
            [red, green, blue] = darkDecline;
            shadedColor = colorShade(numPercent, red, green, blue);

        } else {
            [red, green, blue] = darkImprove;
            shadedColor = colorShade(numPercent, red, green, blue);
        }
    }
    let [r, g, b] = shadedColor;
    let hexColor = rgbToHex(r, g, b);

    const v = trimDisplayMetric(Math.abs(deltaNum));
    let numHtml: string;
    let metricStyle: string;
    if (num === 0 || compareNum === ERROR_CODE) {
        hexColor = '#ffffff';
        numHtml = num?.toString();
        metricStyle = '_metricSortIcon';
    } else if (!isVisual) {
        hexColor = '#ffffff';
        numHtml = num + " (" + v + ")";
        metricStyle = 'metricSortIcon';
    }
    else {
        numHtml = num + " (" + v + ")";
        metricStyle = 'metricSortIcon';
    }
    let results: any;
    if (num < compareNum) {
        results = <span key={num} style={{ backgroundColor: hexColor }}>{numHtml}<FontIcon aria-label="SortDown" iconName="SortDown" className={metricStyle} /></span>;
    } else {
        results = <span key={num} style={{ backgroundColor: hexColor }}>{numHtml}<FontIcon aria-label="SortUp" iconName="SortUp" className={metricStyle} /></span>;
    }
    return [results];
}
/**
 * 
 * @param items 
 * @param selectedCohortsKeys 
 * @returns 
*/
const comparativeClassificationData = (items: any, selectedCohortsKeys: any): [any, any] => {
    let metricsData = {};
    let baselineData = {};
    for (let m in comparativeClassificationMetrics) {
        let v = comparativeClassificationMetrics[m];
        metricsData[v] = [];
        baselineData[v] = [];
    }
    for (let i in items) {
        let _item = items[i];
        /**
         * Filter out unregistered models.
        */

        if (_item.registeredModel && _item.notebookVisible) {
            for (let i in _item.metrics) {
                let _record = _item.metrics[i];
                const index = selectedCohortsKeys.indexOf(_record.testDataset);
                if (index === -1) { continue; }
                if (!_item.isBaseModel) {
                    metricsData[comparativeClassificationMetrics.Accuracy].push(_record[comparativeClassificationMetrics.Accuracy]);
                    metricsData[comparativeClassificationMetrics.F1Score].push(_record[comparativeClassificationMetrics.F1Score]);
                    metricsData[comparativeClassificationMetrics.LogLoss].push(_record[comparativeClassificationMetrics.LogLoss]);
                    metricsData[comparativeClassificationMetrics.Precision].push(_record[comparativeClassificationMetrics.Precision]);
                    metricsData[comparativeClassificationMetrics.Recall].push(_record[comparativeClassificationMetrics.Recall]);
                    metricsData[comparativeClassificationMetrics.ROCAUC].push(_record[comparativeClassificationMetrics.ROCAUC]);
                    metricsData['isCohort'].push(_record.isCohort);
                    if (_record.isCohort && _record.mapTo.length < 1) {
                        _record.mapTo = _record.testDataset;
                    }
                    metricsData['mapTo'].push(_record.mapTo);
                    metricsData['datasetNames'].push(_record.testDataset);
                    metricsData['masterDatasets'].push(_item.testDataset);
                }
                else {
                    baselineData[comparativeClassificationMetrics.Accuracy].push(_record[comparativeClassificationMetrics.Accuracy]);
                    baselineData[comparativeClassificationMetrics.F1Score].push(_record[comparativeClassificationMetrics.F1Score]);
                    baselineData[comparativeClassificationMetrics.LogLoss].push(_record[comparativeClassificationMetrics.LogLoss]);
                    baselineData[comparativeClassificationMetrics.Precision].push(_record[comparativeClassificationMetrics.Precision]);
                    baselineData[comparativeClassificationMetrics.Recall].push(_record[comparativeClassificationMetrics.Recall]);
                    baselineData[comparativeClassificationMetrics.ROCAUC].push(_record[comparativeClassificationMetrics.ROCAUC]);
                    baselineData['isCohort'].push(_record.isCohort);
                    baselineData['mapTo'].push(_record.mapTo);
                    baselineData['datasetNames'].push(_record.testDataset);
                    baselineData['masterDatasets'].push(_item.testDataset);
                }
            }
        }
    }
    return [metricsData, baselineData];
}
/**
 * 
 * @param items 
 * @param selectedCohortsKeys 
 * @returns 
*/
const comparativeRegressionData = (items: any, selectedCohortsKeys: any): [any, any] => {
    let metricsData = {};
    let baselineData = {};

    for (let m in comparativeRegressionMetrics) {
        let v = comparativeRegressionMetrics[m];
        metricsData[v] = [];
        baselineData[v] = [];
    }

    for (let i in items) {
        let _item = items[i];
        /**
         * Filter out unregistered models.
        */
        if (_item.registeredModel && _item.notebookVisible) {
            for (let i in _item.metrics) {
                let _record = _item.metrics[i];
                const index = selectedCohortsKeys.indexOf(_record.testDataset);
                if (index === -1) { continue; }
                if (!_item.isBaseModel) {
                    metricsData[comparativeRegressionMetrics.mae].push(_record[comparativeRegressionMetrics.mae]);
                    metricsData[comparativeRegressionMetrics.mse].push(_record[comparativeRegressionMetrics.mse]);
                    metricsData[comparativeRegressionMetrics.r2].push(_record[comparativeRegressionMetrics.r2]);
                    metricsData[comparativeRegressionMetrics.rmse].push(_record[comparativeRegressionMetrics.rmse]);
                    metricsData['isCohort'].push(_record.isCohort);
                    if (_record.isCohort && _record.mapTo.length < 1) {
                        _record.mapTo = _record.testDataset;
                    }
                    metricsData['mapTo'].push(_record.mapTo);
                    metricsData['datasetNames'].push(_record.testDataset);
                    metricsData['masterDatasets'].push(_item.testDataset);
                }
                else {
                    baselineData[comparativeRegressionMetrics.mae].push(_record[comparativeRegressionMetrics.mae]);
                    baselineData[comparativeRegressionMetrics.mse].push(_record[comparativeRegressionMetrics.mse]);
                    baselineData[comparativeRegressionMetrics.r2].push(_record[comparativeRegressionMetrics.r2]);
                    baselineData[comparativeRegressionMetrics.rmse].push(_record[comparativeRegressionMetrics.rmse]);
                    baselineData['isCohort'].push(_record.isCohort);
                    baselineData['mapTo'].push(_record.mapTo);
                    baselineData['datasetNames'].push(_record.testDataset);
                    baselineData['masterDatasets'].push(_item.testDataset);
                }
            }
        }
    }
    return [metricsData, baselineData];
}
/**
 * Prepare the models data for teh heatmap component.
 * @returns 
*/
export const comparativeHeatmapData = (items: any, problemType: string, selectedCohortsKeys: any): [any, any, ICompareMetricsBounds] => {
    let metricsData = {};
    let baselineData = {};
    if (problemType.toLowerCase() === 'classification') {
        [metricsData, baselineData] = comparativeClassificationData(items, selectedCohortsKeys);
    } else {
        [metricsData, baselineData] = comparativeRegressionData(items, selectedCohortsKeys);
    }

    let [metricsBoundsDict] = getCompareDataBounds(metricsData, baselineData, problemType);
    return [metricsData, baselineData, metricsBoundsDict];
}
/**
 * 
 * @param items 
 * @param problemType 
 * @returns 
*/
export const absoluteHeatmapData = (items: any, problemType: string, selectedCohortsKeys: any) => {
    let metricsGlobalHighLow = {};
    let metricHighLow = {};
    if (problemType.toLowerCase() === 'classification') {
        [metricHighLow, metricsGlobalHighLow] = absoluteClassificationData(items, selectedCohortsKeys);
    } else {
        [metricHighLow, metricsGlobalHighLow] = absoluteRegressionData(items, selectedCohortsKeys);
    }
    return [metricHighLow, metricsGlobalHighLow];
}
/**
 * 
 * @param metricData 
 * @returns 
*/
const getMetricMinMax = (metricData: any): [number, number] => {
    let min = Number.MAX_SAFE_INTEGER;
    let max = Number.MIN_SAFE_INTEGER;

    for (let i in metricData) {
        const v = metricData[i];
        if (v === -99) continue;
        if (v > max) {
            max = v;
        }
        if (v < min) {
            min = v;
        }
    }

    if (min === Number.MAX_SAFE_INTEGER) { min = -1; }
    if (max === Number.MIN_SAFE_INTEGER) { max = 1; }

    return [min, max];
}
/**
 * 
 * @param metricsData 
 * @returns 
*/
const getGlobalMinMax = (metricsData: any): [number, number] => {
    let max = Number.MIN_SAFE_INTEGER;
    let min = Number.MAX_SAFE_INTEGER;

    for (let i in metricsData) {
        const mData = metricsData[i];
        for (let j in mData) {
            const v = mData[j];
            if (v === -99) continue;
            if (v > max) {
                max = v;
            }
            if (v < min) {
                min = v;
            }
        }
    }
    return [min, max];
}
/**
 * 
 * @param items 
 * @param selectedCohortsKeys 
 * @returns 
*/
const absoluteClassificationData = (items: any, selectedCohortsKeys: any): [any, any] => {
    /**
     * Define and instantiate the metrics data objects.
    */
    let metricsData = {};
    let metricHighLow = {};
    let metricsGlobalHighLow = {};
    for (let m in classificationMetrics) {
        let v = classificationMetrics[m];
        metricsData[v] = [];
    }
    for (let i in items) {
        let _item = items[i];
        /**
         * Filter out unregistered models.
        */
        if (_item.registeredModel && _item.notebookVisible) {
            for (let i in _item.metrics) {
                let _record = _item.metrics[i];
                const index = selectedCohortsKeys.indexOf(_record.testDataset);
                if (index === -1) { continue; }
                metricsData[classificationMetrics.Accuracy].push(_record[classificationMetrics.Accuracy]);
                metricsData[classificationMetrics.F1Score].push(_record[classificationMetrics.F1Score]);
                metricsData[classificationMetrics.LogLoss].push(_record[classificationMetrics.LogLoss]);
                metricsData[classificationMetrics.Precision].push(_record[classificationMetrics.Precision]);
                metricsData[classificationMetrics.Recall].push(_record[classificationMetrics.Recall]);
                metricsData[classificationMetrics.ROCAUC].push(_record[classificationMetrics.ROCAUC]);
            }
        }
    }
    for (let m in classificationMetrics) {
        const index = classificationMetrics[m];
        let metricData = [metricsData[index]];
        let [min, max] = getMetricMinMax(metricData[0]);

        if (m === 'F1Score') { m = 'F1 Score'; }
        else if (m === 'LogLoss') { m = 'Log Loss'; }
        else if (m === 'ROCAUC') { m = 'ROC AUC'; }
        metricHighLow[m] = [min, max];
    }
    metricsGlobalHighLow = getGlobalMinMax(metricsData);
    return [metricHighLow, metricsGlobalHighLow];
}
/**
 * 
 * @param items 
 * @param metricsData 
 * @returns 
*/
const absoluteRegressionData = (items: any, selectedCohortsKeys: any): [any, any] => {
    /**
     * Define and instantiate the metrics data objects.
    */
    let metricsData = {};
    let metricHighLow = {};
    let metricsGlobalHighLow = {};
    for (let m in regressionMetrics) {
        let v = regressionMetrics[m];
        metricsData[v] = [];
    }
    for (let i in items) {
        let _item = items[i];
        /**
         * Filter out unregistered models.
        */
        if (_item.registeredModel && _item.notebookVisible) {
            for (let i in _item.metrics) {
                let _record = _item.metrics[i];
                const index = selectedCohortsKeys.indexOf(_record.testDataset);
                if (index === -1) { continue; }
                metricsData[regressionMetrics.mae].push(_record[regressionMetrics.mae]);
                metricsData[regressionMetrics.mse].push(_record[regressionMetrics.mse]);
                metricsData[regressionMetrics.r2].push(_record[regressionMetrics.r2]);
                metricsData[regressionMetrics.rmse].push(_record[regressionMetrics.rmse]);
            }
        }
    }
    for (let m in regressionMetrics) {
        const index = regressionMetrics[m];
        let metricData = [metricsData[index]];

        let [min, max] = getMetricMinMax(metricData[0]);
        metricHighLow[m] = [min, max];

    }
    metricsGlobalHighLow = getGlobalMinMax(metricsData);
    return [metricHighLow, metricsGlobalHighLow];
}
/**
 * @param metricsData 
 * @param baselineData 
 * @returns 
*/
const getCompareDataBounds = (metricsData: any, baselineData: any, problemType: string): [ICompareMetricsBounds] => {
    if (problemType.toLowerCase() === 'classification') {
        return classificationDataBound(metricsData, baselineData);
    } else {
        return regressionDataBound(metricsData, baselineData);
    }
}
/**
 * 
 * @param metricsData 
 * @param baselineData 
 * @returns 
*/
const regressionDataBound = (metricsData: any, baselineData: any): [ICompareMetricsBounds] => {
    const cohortMetrics = metricsData['isCohort'];
    const cohortBaseline = baselineData['isCohort'];
    let metricsBoundsDict = {} as ICompareMetricsBounds;
    let metricBounds = {} as ICompareMetricBounds;
    let minMetric = Number.MAX_SAFE_INTEGER;
    let maxMetric = Number.MIN_SAFE_INTEGER;

    for (let index in regressionMetrics) {
        let m = regressionMetrics[index];
        const metricBaselineData = baselineData[m];
        const metricData = metricsData[m];
        let minDelta = Number.MAX_SAFE_INTEGER;
        let maxDelta = Number.MIN_SAFE_INTEGER;
        let minCohort = Number.MAX_SAFE_INTEGER;
        let maxCohort = Number.MIN_SAFE_INTEGER;
        let minAll = Number.MAX_SAFE_INTEGER;
        let maxAll = Number.MIN_SAFE_INTEGER;
        const _metricData = metricsData[m];
        const _cohortMetrics = metricsData['isCohort'];
        const _masterDatasets = metricsData['masterDatasets'];
        const _baselineData = baselineData[m];
        const _cohortBaseline = baselineData['isCohort'];
        const baselineDatasets = baselineData['datasetNames'];
        const _mapTo = metricsData['mapTo'];
        const _baselineMasterDatasets = baselineData['masterDatasets'];
        for (let i in metricBaselineData) {
            const v = metricBaselineData[i];

            if (cohortBaseline[i] === false) {
                maxAll = v;
                minAll = v;
            }
            else {
                if (maxCohort < v) {
                    maxCohort = v;
                }
                if (minCohort > v) {
                    minCohort = v;
                }
            }
        }
        for (let i in metricData) {
            const v = metricData[i];
            if (v === -99) continue;
            const compareNum = getCompareNum(v, metricsData['mapTo'][i], _metricData, _cohortMetrics, _baselineData, _cohortBaseline, _masterDatasets, _baselineMasterDatasets, _mapTo, baselineDatasets);

            if (compareNum === -99) continue;
            if (cohortMetrics[i] === false) {
                if (maxDelta < (Math.abs(v - compareNum))) {
                    maxDelta = Math.abs(v - compareNum);
                }
                if (minDelta > (Math.abs(v - compareNum))) {
                    minDelta = Math.abs(v - compareNum);
                }
                if (maxAll < v) {
                    maxAll = v;
                }

                if (minAll > v) {
                    minAll = v;
                }
            }
            else {
                if (maxDelta < (Math.abs(v - compareNum))) {
                    maxDelta = Math.abs(v - compareNum);
                }
                if (minDelta > (Math.abs(v - compareNum))) {
                    minDelta = Math.abs(v - compareNum);
                }
                if (maxCohort < v) {
                    maxCohort = v;
                }
                if (minCohort > v) {
                    minCohort = v;
                }
            }
        }
        if (minAll === Number.MAX_SAFE_INTEGER) { minAll = 1; }
        if (maxAll === Number.MIN_SAFE_INTEGER) { maxAll = 1; }
        if (minCohort === Number.MAX_SAFE_INTEGER) { minCohort = 1; }
        if (maxCohort === Number.MIN_SAFE_INTEGER) { maxCohort = 1; }
        if (minDelta === Number.MAX_SAFE_INTEGER) { minDelta = 1; }
        if (maxDelta === Number.MIN_SAFE_INTEGER) { maxDelta = 1; }
        metricBounds.minAll = trimDisplayMetric(minAll);
        metricBounds.maxAll = trimDisplayMetric(maxAll);
        metricBounds.minCohort = trimDisplayMetric(minCohort);
        metricBounds.maxCohort = trimDisplayMetric(maxCohort);
        metricBounds.minDelta = trimDisplayMetric(minDelta);
        metricBounds.maxDelta = trimDisplayMetric(maxDelta);
        if (minMetric > metricBounds.minAll) { minMetric = metricBounds.minAll; }
        if (maxMetric < metricBounds.maxAll) { maxMetric = metricBounds.maxAll; }
        metricBounds.minMetric = trimDisplayMetric(minMetric);
        metricBounds.maxMetric = trimDisplayMetric(maxMetric);
        metricsBoundsDict[m] = metricBounds;
        metricBounds = {} as ICompareMetricBounds;
    }
    return [metricsBoundsDict];
}
/**
 * 
 * @param metricsData 
 * @param baselineData 
 * @returns 
*/
const classificationDataBound = (metricsData: any, baselineData: any): [ICompareMetricsBounds] => {
    const cohortMetrics = metricsData['isCohort'];
    const cohortBaseline = baselineData['isCohort'];
    let metricsBoundsDict = {} as ICompareMetricsBounds;
    let metricBounds = {} as ICompareMetricBounds;
    let minMetric = Number.MAX_SAFE_INTEGER;
    let maxMetric = Number.MIN_SAFE_INTEGER;
    for (let index in classificationMetrics) {
        let m = classificationMetrics[index];
        const metricBaselineData = baselineData[m];
        const metricData = metricsData[m];
        let minDelta = Number.MAX_SAFE_INTEGER;
        let maxDelta = Number.MIN_SAFE_INTEGER;
        let minCohort = Number.MAX_SAFE_INTEGER;
        let maxCohort = Number.MIN_SAFE_INTEGER;
        let minAll = Number.MAX_SAFE_INTEGER;
        let maxAll = Number.MIN_SAFE_INTEGER;
        const _metricData = metricsData[m];
        const _cohortMetrics = metricsData['isCohort'];
        const _masterDatasets = metricsData['masterDatasets'];
        const _baselineData = baselineData[m];
        const _cohortBaseline = baselineData['isCohort'];
        const baselineDatasets = baselineData['datasetNames'];
        const _mapTo = metricsData['mapTo'];
        const _baselineMasterDatasets = baselineData['masterDatasets'];
        for (let i in metricBaselineData) {
            const v = metricBaselineData[i];

            if (cohortBaseline[i] === false) {
                maxAll = v;
                minAll = v;
            }
            else {
                if (maxCohort < v) {
                    maxCohort = v;
                }
                if (minCohort > v) {
                    minCohort = v;
                }
            }
        }
        for (let i in metricData) {
            const v = metricData[i];
            if (v === -99) continue;
            const compareNum = getCompareNum(v, metricsData['mapTo'][i], _metricData, _cohortMetrics, _baselineData, _cohortBaseline, _masterDatasets, _baselineMasterDatasets, _mapTo, baselineDatasets);

            if (compareNum === -99) continue;
            if (cohortMetrics[i] === false) {
                if (maxDelta < (Math.abs(v - compareNum))) {
                    maxDelta = Math.abs(v - compareNum);
                }
                if (minDelta > (Math.abs(v - compareNum))) {
                    minDelta = Math.abs(v - compareNum);
                }
                if (maxAll < v) {
                    maxAll = v;
                }

                if (minAll > v) {
                    minAll = v;
                }
            }
            else {
                if (maxDelta < (Math.abs(v - compareNum))) {
                    maxDelta = Math.abs(v - compareNum);
                }
                if (minDelta > (Math.abs(v - compareNum))) {
                    minDelta = Math.abs(v - compareNum);
                }
                if (maxCohort < v) {
                    maxCohort = v;
                }
                if (minCohort > v) {
                    minCohort = v;
                }
            }
        }
        if (minAll === Number.MAX_SAFE_INTEGER) { minAll = 1; }
        if (maxAll === Number.MIN_SAFE_INTEGER) { maxAll = 1; }
        if (minCohort === Number.MAX_SAFE_INTEGER) { minCohort = 1; }
        if (maxCohort === Number.MIN_SAFE_INTEGER) { maxCohort = 1; }
        if (minDelta === Number.MAX_SAFE_INTEGER) { minDelta = 1; }
        if (maxDelta === Number.MIN_SAFE_INTEGER) { maxDelta = 1; }
        metricBounds.minAll = trimDisplayMetric(minAll);
        metricBounds.maxAll = trimDisplayMetric(maxAll);
        metricBounds.minCohort = trimDisplayMetric(minCohort);
        metricBounds.maxCohort = trimDisplayMetric(maxCohort);
        metricBounds.minDelta = trimDisplayMetric(minDelta);
        metricBounds.maxDelta = trimDisplayMetric(maxDelta);
        if (minMetric > metricBounds.minAll) { minMetric = metricBounds.minAll; }
        if (maxMetric < metricBounds.maxAll) { maxMetric = metricBounds.maxAll; }
        metricBounds.minMetric = trimDisplayMetric(minMetric);
        metricBounds.maxMetric = trimDisplayMetric(maxMetric);
        if (m === 'F1Score') { m = 'F1 Score'; }
        else if (m === 'LogLoss') { m = 'Log Loss'; }
        else if (m === 'ROCAUC') { m = 'ROC AUC'; }
        metricsBoundsDict[m] = metricBounds;
        metricBounds = {} as ICompareMetricBounds;
    }
    return [metricsBoundsDict];
}
/**
 * 
 * @param metricsBoundsDict 
 * @returns 
*/
const getComparativeGlobalMinMax = (metricsBoundsDict: ICompareMetricsBounds): [number, number] => {
    let globalMin = Number.MAX_SAFE_INTEGER;
    let globalMax = Number.MIN_SAFE_INTEGER;
    for (let metric in metricsBoundsDict) {
        const v = metricsBoundsDict[metric];
        if (globalMin > v['minAll']) { globalMin = v['minAll']; }
        if (globalMin > v['minCohort']) { globalMin = v['minCohort']; }
        if (globalMax < v['maxAll']) { globalMax = v['maxAll']; }
        if (globalMax < v['maxCohort']) { globalMax = v['maxCohort']; }
    }
    return [globalMin, globalMax];
}
