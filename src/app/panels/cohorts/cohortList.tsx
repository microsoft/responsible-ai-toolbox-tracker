// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import * as React from 'react';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Stack, IconButton, Text, TooltipHost } from '@fluentui/react';
import {
    DetailsList,
    DetailsListLayoutMode,
    SelectionMode,
    IColumn
} from '@fluentui/react/lib/DetailsList';
import { Utils } from '../../../core/utils';
import { DeleteCohort } from './deleteCohort';
import { DuplicateCohort } from './duplicateCohort';
import { IDatasetType } from "src/core/components";
import { ICohortList, ICohortInfo } from './cohortTypes';

export const CohortList: React.FunctionComponent = () => {
    const dispatch = useDispatch();
    const state = useSelector((state) => state);
    const projectName = state['projectSettings']['name'];
    const datasets = state['projectSettings']['datasets'];
    let cohortsList = state['projectSettings']['cohortsList'];
    const _getKey = (item: any, index?: number): string => {
        return item.key;
    }
    const _onColumnClick = (ev: React.MouseEvent<HTMLElement>, column: IColumn): void => {
        const _columns = cohortsState.columns;
        let _items = cohortsState.items
        if (!_items) {
            _items = cohortsList;
        }
        const newColumns: IColumn[] = _columns.slice();
        const currColumn: IColumn = newColumns.filter(currCol => column.key === currCol.key)[0];
        newColumns.forEach((newCol: IColumn) => {
            if (newCol === currColumn) {
                currColumn.isSortedDescending = !currColumn.isSortedDescending;
                currColumn.isSorted = true;
            } else {
                newCol.isSorted = false;
                newCol.isSortedDescending = true;
            }
        });
        const sortedItems = _copyAndSort(_items, currColumn.fieldName!, currColumn.isSortedDescending);
        setCohortState((prev) => {
            return { ...prev, items: sortedItems, columns: newColumns };
        });
    }
    /**
     * 
     * @param items 
     * @param columnKey 
     * @param isSortedDescending 
     * @returns 
     */
    function _copyAndSort<T>(items: T[], columnKey: string, isSortedDescending?: boolean): T[] {
        const key = columnKey as keyof T;
        return items.slice(0).sort((a: T, b: T) => ((isSortedDescending ? a[key] < b[key] : a[key] > b[key]) ? 1 : -1));
    }
    const columns: IColumn[] = [
        {
            key: 'col1',
            name: 'Cohort',
            fieldName: 'name',
            minWidth: 80,
            maxWidth: 140,
            isRowHeader: true,
            isResizable: true,
            isSorted: true,
            isSortedDescending: false,
            sortAscendingAriaLabel: 'Sorted A to Z',
            sortDescendingAriaLabel: 'Sorted Z to A',
            onColumnClick: _onColumnClick,
            data: 'string',
            isPadded: true,
            onRenderHeader: () => {
                return (
                    <TooltipHost content='Sort by cohort name'>
                        <Text className="cohortHeaders">Cohort</Text>
                    </TooltipHost >)
            },
            onRender: (item: ICohortList) => {
                return (
                    <TooltipHost content={item.name}>
                        <Text variant={"medium"}>{item.name}</Text>
                    </TooltipHost>
                )
            },
        },
        {
            key: 'col2',
            name: 'Dataset',
            fieldName: 'masterName',
            minWidth: 70,
            maxWidth: 70,
            isResizable: true,
            data: 'string',
            onColumnClick: _onColumnClick,
            onRenderHeader: () => {
                return (
                    <TooltipHost content='Sort by master dataset'>
                        <Text className="cohortHeaders">Dataset</Text>
                    </TooltipHost >)
            },
            onRender: (item: ICohortList) => {
                return (
                    <TooltipHost content={item.masterName}>
                        <Text variant={"medium"}>{item.masterName}</Text>
                    </TooltipHost >)
            },
            isPadded: true,
        },
        {
            key: 'col3',
            name: 'Details',
            fieldName: 'lastUpdated',
            minWidth: 70,
            maxWidth: 70,
            isResizable: true,
            data: 'string',
            onColumnClick: _onColumnClick,
            onRenderHeader: () => {
                return (
                    <TooltipHost content='Sort by last modified date'>
                        <Text className="cohortHeaders">Details</Text>
                    </TooltipHost >)
            },
            onRender: (item: ICohortList) => {
                return (
                    <Stack horizontal={false} tokens={{ childrenGap: "-5px" }}>
                        <Stack.Item>
                            <TooltipHost content={`The date the cohort was last modified`}>
                                <Text variant={"xSmall"}>{item.lastUpdated}</Text>
                            </TooltipHost>
                        </Stack.Item>
                        <Stack.Item>
                            <TooltipHost content={`Data points count`}>
                                <Text variant={"xSmall"}>{item.recordsCount} dataPoints</Text>
                            </TooltipHost>
                        </Stack.Item>
                        <Stack.Item>
                            <TooltipHost content={`Filters count`}>
                                <Text variant={"xSmall"}>{item.filtersCount} filters</Text>
                            </TooltipHost>
                        </Stack.Item>
                    </Stack>
                )
            },
            isPadded: true,
        },
        {
            key: 'col4',
            name: 'Action',
            fieldName: 'action',
            minWidth: 100,
            maxWidth: 130,
            isResizable: true,
            data: 'string',
            onRenderHeader: () => {
                return (
                    <TooltipHost content='Delete, edit, or duplicate your cohort'>
                        <Text className="cohortHeaders">Action</Text>
                    </TooltipHost >)
            },
            onRender: (item: ICohortList) => {
                return (
                    <Stack horizontal tokens={{ childrenGap: "10px" }}>
                        <Stack.Item>
                            <IconButton
                                id={item.key + 'edit'}
                                name={item.name}
                                data={item.key}
                                title="Edit cohort"
                                text="Edit"
                                iconProps={{ iconName: "Edit" }}
                                onClick={_onEditCohort}
                                disabled={item.key === item.masterKey}
                            />
                        </Stack.Item>
                        <Stack.Item>
                            <IconButton
                                id={item.key + 'duplicate'}
                                name={item.name}
                                title="Duplicate cohort"
                                text="Duplicate"
                                iconProps={{ iconName: "DuplicateRow" }}
                                onClick={_onCohortDuplicate}
                                disabled={item.key === item.masterKey}
                            />
                        </Stack.Item>
                        <Stack.Item>
                            <IconButton
                                id={item.key}
                                name={item.name}
                                title="Delete cohort"
                                iconProps={{ iconName: "Trash" }}
                                onClick={_onCohortDelete}
                                disabled={item.key === item.masterKey}
                            />
                        </Stack.Item>
                    </Stack>
                )
            },
            isPadded: true,
        },
    ];

    /**
     * 
     * @param cohortId 
     * @param cohortName 
    */
    const _getEditCohort = (cohortId: string, cohortName: string) => {
        _getAllCohorts(false).then(_cohorts => {
            if (_cohorts) {
                for (let i = 0; i < _cohorts.length; i++) {
                    if (_cohorts[i].key === cohortId && _cohorts[i].name === cohortName) {
                        _cohorts[i].isEditState = true;
                        dispatch({ type: 'UPDATE_COHORT_SETTINGS_LIST', payload: _cohorts });
                        dispatch({ type: 'COHORT_EDIT_PANEL_STATE', payload: _cohorts[i] });
                    }
                }
            }
        });
    }
    /**
     * 
     * @param event 
     */
    const _onEditCohort = (event: any): void => {
        const id = event.currentTarget.id.replace('edit', '');
        _getEditCohort(id, event.currentTarget.name);
    }
    const [cohortInfo, setCohortInfo] = useState<ICohortInfo>();
    const _onCohortDuplicate = (event: any): void => {
        const id = event.currentTarget.id.replace('duplicate', '');
        let _cohort: IDatasetType;
        let _items = cohortsState.items;

        if (_items) {
            _cohort = {} as IDatasetType;
            for (let index in _items) {
                if (_items[index].key === id) {
                    _cohort = Object.assign({}, _items[index])
                }
            }
        }
        let info = {} as ICohortInfo;
        info.cohortKey = id;
        info.cohortName = event.currentTarget.name;
        info.cohort = _cohort;
        info.cohortsList = cohortsList;
        setCohortInfo(info);
        dispatch({ type: 'COHORT_DUPLICATE_DIALOG_STATE', payload: false });
    }
    const _onCohortDelete = (event: any): void => {
        let info = {} as ICohortInfo;
        info.cohortKey = event.currentTarget.id;
        info.cohortName = event.currentTarget.name;
        info.cohortsList = cohortsList;
        setCohortInfo(info);
        dispatch({ type: 'COHORT_DELETE_DIALOG_STATE', payload: false });
    }
    /**
     * Get Cohort data.
    */
    const _getAllCohorts = async (isList: boolean = true): Promise<any> => {
        let _utils = new Utils();
        const allCohorts = await _utils.GetAllCohorts(datasets, projectName);

        if (allCohorts) {
            cohortsList = [];
            for (let i in allCohorts) {
                const dataObj = allCohorts[i];
                cohortsList.push({
                    key: dataObj.key,
                    name: dataObj.name,
                    isCohort: dataObj.isCohort,
                    masterKey: dataObj.masterKey,
                    masterName: dataObj.masterName,
                    labelIndex: dataObj.labelIndex,
                    label: dataObj.label,
                    registeredModel: dataObj.registeredModel,
                    mlPlatform: dataObj.mlPlatform,
                    mlFlowRunId: dataObj.mlFlowRunId,
                    features: dataObj.features,
                    featuresValues: dataObj.featuresValues,
                    header: dataObj.header,
                    separator: dataObj.separator,
                    filterValuesList: dataObj.filterValuesList,
                    dataMatrix: dataObj.dataMatrix,
                    dateCreated: dataObj.dateCreated,
                    lastUpdated: dataObj.lastUpdated,
                    recordsCount: dataObj.recordsCount,
                });
            }
        }
        dispatch({ type: 'UPDATE_COHORT_SETTINGS_LIST', payload: cohortsList });
        if (isList)
            return cohortsList;
        else {
            return allCohorts;
        }
    }
    const [cohortsState, setCohortState] = useState({
        items: cohortsList,
        columns: columns,
    });
    useEffect(() => {
        _getAllCohorts(true).then(content => {
            if (content) {
                setCohortState({ items: cohortsList, columns: columns });
            }
        });
    }, []);
    useEffect(() => {
        setCohortState({ items: cohortsList, columns: columns });
    }, [cohortsList]);
    /**
     * wait until itemState is populated async.
    */
    if (!cohortsState.items) {
        return (<div />);
    }
    return (
        <div>
            <DetailsList
                items={cohortsState.items}
                compact={true}
                columns={cohortsState.columns}
                selectionMode={SelectionMode.none}
                getKey={_getKey}
                setKey="none"
                layoutMode={DetailsListLayoutMode.justified}
                isHeaderVisible={true}
                className="cohortListStyle"
            />
            <DeleteCohort
                children={cohortInfo}
            />
            <DuplicateCohort
                children={cohortInfo}
            />
        </div>
    );

}