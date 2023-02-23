// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
export interface ICompareMetricsBounds {
    /**
     * 
    */
    metricsBounds: ICompareMetricBounds[];
}
/**
 * 
*/
export interface ICompareMetricBounds {
    /**
    * 
    */
    maxDelta: number;
    /**
    * 
    */
    minDelta: number;
    /**
    * 
    */
    minMetric: number;
    /**
    * 
    */
    maxMetric: number;
    /**
    * 
    */
    minAll: number;
    /**
    * 
    */
    maxAll: number;
    /**
    * 
    */
    minCohort: number;
    /**
    * 
    */
    maxCohort: number;
}
/**
 * Supported operations.
*/
export enum comparativeClassificationMetrics {
    Accuracy = 'Accuracy',
    F1Score = 'F1 Score',
    LogLoss = 'Log Loss',
    Precision = 'Precision',
    Recall = 'Recall',
    ROCAUC = 'ROC AUC',
    isCohort = 'isCohort',
    mapTo = 'mapTo',
    datasetNames = 'datasetNames',
    masterDatasets = 'masterDatasets',
}
/**
 * Supported operations.
*/
export enum comparativeRegressionMetrics {
    mae = 'mae',
    mse = 'mse',
    r2 = 'r2',
    rmse = 'rmse',
    mapTo = 'mapTo',
    isCohort = 'isCohort',
    datasetNames = 'datasetNames',
    masterDatasets = 'masterDatasets',
}
/**
 * Supported operations.
*/
export enum regressionMetrics {
    mae = 'mae',
    mse = 'mse',
    r2 = 'r2',
    rmse = 'rmse'
}
/**
 * Supported operations.
*/
export enum classificationMetrics {
    Accuracy = 'Accuracy',
    F1Score = 'F1 Score',
    LogLoss = 'Log Loss',
    Precision = 'Precision',
    Recall = 'Recall',
    ROCAUC = 'ROC AUC',
}
export interface IClassificationMetrics {
    /**
    * 
    */
    isCohort: string;
    /**
    * 
    */
    datasetNames: string;
    /**
    * 
    */
    masterDatasets: string;
    /**
    * 
    */
    metrics: classificationMetrics
}
export interface IRegressionMetrics {
    /**
    * 
    */
    isCohort: string;
    /**
    * 
    */
    datasetNames: string;
    /**
    * 
    */
    masterDatasets: string;
    /**
    * 
    */
    metrics: regressionMetrics
}