// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import {
    IFilter,
    ICompositeFilter,
} from "./cohortTypes";
export class Cohort {
    /**
     * Store the cohort numeric values.  Store the index for categorical values.
     */
    public dataDict: Array<{ [key: string]: number }> | undefined;

    public constructor(
        protected name: string,
        protected dataset?: any[][],
        protected filters: IFilter[] = [],
        protected compositeFilters: ICompositeFilter[] = [],
    ) {
        this.name = name;
        this.dataset = dataset;
        this.filters = filters;
        this.compositeFilters = compositeFilters;
    }

}