// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { FilterOperations, IFilter, ICohortList } from "./cohortTypes";
import { IDatasetType } from '../../../core/components';

/**
 * 
 * @param filters 
 * @returns 
 */
export function getFilterOutput(filter: IFilter): string {
    let operation = "";
    if (filter.isCategorical) {
        const args = filter.args.map((arg) => arg).join(", ");
        return `${filter.column} includes (${args})`;
    }
    if (filter.operation === FilterOperations.InTheRangeOf) {
        const arg0 = filter.args[0].toFixed(2);
        const arg1 = filter.args[1].toFixed(2);
        return `${filter.column} [${arg0}, ${arg1}]`;
    }
    if (filter.operation === FilterOperations.Equal) {
        operation = "==";
    } else if (filter.operation === FilterOperations.GreaterThan) {
        operation = ">";
    } else if (filter.operation === FilterOperations.GreaterThanEqualTo) {
        operation = ">=";
    } else if (filter.operation === FilterOperations.LessThan) {
        operation = "<";
    } else if (filter.operation === FilterOperations.LessThanEqualTo) {
        operation = "<=";
    }
    return `${filter.column} ${operation} ${filter.args[0].toFixed(2)}`;

}
/**
 * 
 * @param filters 
 * @returns 
 */
export function getFiltersString(filters: IFilter[]): string[] {
    return filters.map((filter: IFilter): string => {
        let operation = "";
        if (filter.isCategorical) {
            const args = filter.args.map((arg) => arg.toFixed(2)).join(", ");
            return `${filter.column} includes (${args})`;
        }  
        if (filter.operation === FilterOperations.InTheRangeOf) {
            const arg0 = filter.args[0].toFixed(2);
            const arg1 = filter.args[1].toFixed(2);
            return `${filter.column} [${arg0}, ${arg1}]`;
        }
        if (filter.operation === FilterOperations.Equal) {
            operation = "==";
        } else if (filter.operation === FilterOperations.GreaterThan) {
            operation = ">";
        } else if (filter.operation === FilterOperations.GreaterThanEqualTo) {
            operation = ">=";
        } else if (filter.operation === FilterOperations.LessThan) {
            operation = "<";
        } else if (filter.operation === FilterOperations.LessThanEqualTo) {
            operation = "<=";
        }
        return `${filter.column} ${operation} ${filter.args[0].toFixed(2)}`;
    });
}
/**
 * 
 * @param a 
 * @param b 
 * @returns 
 */
export function compare(a: string | number, b: string | number): 1 | 0 | -1 {
    if (a > b) {
        return 1;
    }
    if (a < b) {
        return -1;
    }
    return 0;
}
/**
 * 
 * @param cohortName 
 * @param cohortsList 
 * @returns 
 */
export function duplicateName(cohortName: string, cohortsList: any[]) {
    for (let ent of cohortsList) {
        if (ent.name.toLowerCase().trim() === cohortName.toLowerCase().trim()) {
            return true;
        }
    }
    return false;
}
/**
 * Get random integer
 * @param min 
 * @param max 
 * @returns random int - min & max inclusive 
 */
export function getRandomNumber(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
/**
 * Identify if a string cannot be parse to a numeric value
 * @param str 
 * @returns A boolean flag
 */
export function notNumeric(str: string) {
    var numericR = parseFloat(str);
    return isNaN(numericR) || numericR.toString().length != str.length;
}
/**
 * Build the cohort data as a matrix.
*/
export const buildDataMatrix = (cohort: IDatasetType, headers: boolean): any[][] => {
    if (cohort?.featuresValues.length === 0) { return null; }

    let dataMatrix: any[][] = [];
    const record = cohort.featuresValues[0];
    let arr = [];

    /**
     * include the headers in the returned result.
    */
    let start = 0;
    if (headers) {
        for (let i in cohort.featuresValues) {
            arr.push(cohort.featuresValues[i].name)
        }
        dataMatrix[0] = arr;
        arr = [];
        start = 1;
    }

    for (let i = 0; i < record.values.length; i++) {
        for (let j in cohort.featuresValues) {
            if (notNumeric(cohort.featuresValues[j].values[i])) {
                arr.push(cohort.featuresValues[j].values[i]);
            } else {
                arr.push(Number(cohort.featuresValues[j].values[i]));
            }
        }
        dataMatrix[i + start] = arr;
        arr = [];
    }
    return dataMatrix;
}
/**
 * 
 * @param columnIndex 
 * @param filter 
 * @param _matrix 
 * @returns 
*/
const applyCategoricalFilters = (columnIndex: number, filter: IFilter, _matrix: any[][]): any => {

    let _tmpMatrix: any[][] = [];
    // const _tempMatrix = cloneDeep(_matrix);
    for (let t in _matrix) {
        let record = _matrix[t];
        if (record.length == 0) { continue; }
        for (let i = 0; i < record.length; i++) {
            if (columnIndex == i) {
                if ((filter.args as any[]).indexOf(record[i]) !== -1) {
                    _tmpMatrix.push(record);
                }
            }
        }
    };
    return _tmpMatrix;
}
/**
 * 
 * @param columnIndex 
 * @param filter 
 * @param _matrix 
 * @returns 
*/
const applyNumericalFilters = (columnIndex: number, filter: IFilter, _matrix: any[][]): any => {
    let _tmpMatrix: any[][] = [];
    for (let t in _matrix) {
        let record = _matrix[t];
        if (record.length == 0) { continue; }
        for (let i = 0; i < record.length; i++) {
            if (columnIndex == i) {
                switch (filter?.operation) {
                    case FilterOperations.Equal:
                        if ((record[i]) === Number(filter.args[0])) {
                            _tmpMatrix.push(record);
                        }
                        break;
                    case FilterOperations.GreaterThan:
                        if ((record[i]) > Number(filter.args[0])) {
                            _tmpMatrix.push(record);
                        }
                        break;
                    case FilterOperations.GreaterThanEqualTo:
                        if ((record[i]) >= Number(filter.args[0])) {
                            _tmpMatrix.push(record);
                        }
                        break;
                    case FilterOperations.LessThan:
                        if ((record[i]) < Number(filter.args[0])) {
                            _tmpMatrix.push(record);
                        }
                        break;
                    case FilterOperations.LessThanEqualTo:
                        if ((record[i]) <= Number(filter.args[0])) {
                            _tmpMatrix.push(record);
                        }
                        break;
                    case FilterOperations.InTheRangeOf:
                        if (((record[i]) > Number(filter.args[0])) && ((record[i]) < Number(filter.args[1]))) {
                            _tmpMatrix.push(record);
                        }
                        break;
                    default:
                        break;
                }
            }
        }
    };
    return _tmpMatrix;
}
/**
 * Apply the filters and create the data.
 * @param cohort 
 * @param dataMatrix 
 * @returns 
*/
export const applyFilters = (cohort: IDatasetType, dataMatrix: any[][]): IDatasetType => {
    /**
     * Matrix local copy
     */
    let _matrix = dataMatrix.slice(1);

    /**
     * Handle the filter operations.
    */
    cohort.filterValuesList.map((filter => {
        const columnIndex = dataMatrix[0].indexOf(filter.column);
        if (columnIndex === -1) {
            console.log('Filter column name is missing.')
        }
        if (filter.args.length < 1) {
            console.log('Filter data is missing.')
        }

        if (filter.isCategorical) {
            _matrix = applyCategoricalFilters(columnIndex, filter, _matrix);
        }
        else {
            _matrix = applyNumericalFilters(columnIndex, filter, _matrix);
        };
    }));
    cohort.dataMatrix = _matrix;
    return cohort;
}
/**
 * 
 * @param _cohort 
 * @param ent 
 * @param _filtersCount 
 * @returns 
 */
const addCohort = (_cohort: ICohortList, ent: any, _filtersCount: number) => {
    _cohort.key = ent.key;
    _cohort.name = ent.name;
    _cohort.masterKey = ent.masterKey;
    _cohort.masterName = ent.masterName;
    _cohort.recordsCount = ent.recordsCount;
    _cohort.filtersCount = _filtersCount;
    _cohort.label = ent.label;
    _cohort.separator = ent.separator;
    _cohort.header = ent.header;
    _cohort.labelIndex = ent.labelIndex;
    _cohort.features = ent.features;
    _cohort.filterValuesList = ent.filterValuesList,
        _cohort.featuresValues = ent.featuresValues,
        _cohort.registeredModel = ent.registeredModel,
        _cohort.mlPlatform = ent.mlPlatform,
        _cohort.mlFlowRunId = ent.mlFlowRunId,
        _cohort.iconName = 'https://static2.sharepointonline.com/files/fabric/assets/item-types/16/csv.svg';
    _cohort.lastUpdated = ent.lastUpdated;
    return _cohort;
}
/**
 * Update the cohort list with the new created or edited data.
 * @param cohortsList 
 * @param ent 
 * @returns 
*/
export const updateCohortsList = async (cohortsList: any, ent: IDatasetType): Promise<ICohortList[]> => {
    if (!cohortsList) {
        return null;
    }
    let _filtersCount = 0;
    if (ent.isCohort) {
        _filtersCount = ent.filterValuesList?.length;
    }

    let _cohorts = [] as ICohortList[];
    let _cohort = {} as ICohortList;
    let _addCohort = true;
    for (let i = 0; i < cohortsList?.length; i++) {
        if (cohortsList[i].key === ent?.key) {
            _addCohort = false;
            _cohorts.push(addCohort(_cohort, ent, _filtersCount));
            _cohort = {} as ICohortList;
        }
        else {
            _cohorts.push(cohortsList[i]);
        }
    }
    if (_addCohort) {
        _cohorts.push(addCohort(_cohort, ent, _filtersCount));
    }
    return _cohorts;
};
/**
 * remove delete cohort from the UI list
 * @param cohortsList 
 * @param cohortKey 
 * @returns 
*/
export const removeCohortFromList = async (cohortsList: ICohortList[], cohortKey: string): Promise<ICohortList[]> => {
    if (!cohortsList) {
        return null;
    }
    let _cohortsList: ICohortList[] = [];

    for (let cohort of cohortsList) {
        if (cohort.key !== cohortKey) {
            _cohortsList.push(cohort);
        }
    }
    return _cohortsList;
};



