// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { IDatasetType } from "src/core/components";
import { IColumn } from '@fluentui/react/lib/DetailsList';
/**
 * Supported operations.
 */
export enum FilterOperations {
    /**
     * (equal to)
     */
    Equal = "Equal to",
    /**
     * (greater than)
     */
    GreaterThan = "Greater than",
    /**
     * (greater than or equal to)
     */
    GreaterThanEqualTo = "Greater than or equal",
    /**
     * (less than)
     */
    LessThan = "Less than",
    /**
     * (less than or equal to)
     */
    LessThanEqualTo = "Less than or equal to",
    /**
     * (in the range of)
     */
    InTheRangeOf = "In the range of"
}
/**
 * Supported union operations.  Initially, only the 'ans' is supported. 
 */
export enum Operations {
    And = "and",
    Or = "or"
}
/**
 * Cohort filter
 */
export interface IFilter {
    key: string;
    operation: FilterOperations;
    isCategorical: boolean;
    args: any[];
    columnIndex: number;
    column: string;
    dataset: string;
    output: string;
}
/**
 * cohort list of filters
 */
export type ICompositeFilter =
    | IFilter
    | {
        compositeFilters: IFilter[];
        operation: Operations;
    };

/**
 * 
 */
export enum RangeTypes {
    Categorical = "categorical",
    Integer = "integer",
    Numeric = "numeric"
}
/**
 * Numeric feature range
 */
export interface INumericRange {
    min: number;
    max: number;
    rangeType: RangeTypes.Integer | RangeTypes.Numeric;
}
/**
 * Categorical feature range.
*/
export interface ICategoricalRange {
    uniqueValues: string[];
    rangeType: RangeTypes.Categorical;
}
/**
 * Filter meta data.
*/
export interface IFilterMeta {
    isCategorical?: boolean;
    categoricalValues: string[];
    featureRange?: INumericRange;
}
/**
 * Cohort list info.
*/
export interface ICohortList {
    key: string;
    name: string;
    masterKey: string;
    masterName: string;
    label: string;
    separator: string;
    header: boolean;
    labelIndex: number;
    features: any;
    filterValuesList: any;
    featuresValues:any;
    recordsCount: number;
    filtersCount: number;
    lastUpdated: string;
    iconName: string;
    registeredModel: string;
    mlPlatform: string;
    mlFlowRunId: string;
}
/**
 * UI state management. 
*/
export interface ICohortListState {
    columns: IColumn[];
    items: ICohortList[];
}
/**
 * cohort data.
*/ 
export interface ICohortInfo {
    cohortKey: string;
    cohortName: string;
    cohort: IDatasetType;
    cohortsList: any;
}
