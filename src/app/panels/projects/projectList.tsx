// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React from 'react';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    Text,
    TooltipHost,
    Link,
    FontIcon,
    IStackItemStyles
} from '@fluentui/react';
import {
    DetailsList,
    DetailsListLayoutMode,
    Selection,
    SelectionMode,
    IColumn
} from '@fluentui/react/lib/DetailsList';
import { Utils } from '../../../core/utils';
import { IProjectPair } from '../../../core/components';

export const ProjectList: React.FunctionComponent = (props) => {
    const dispatch = useDispatch();
    const children = props.children;
    let isProjectDelete = false;
    if (children) {
        isProjectDelete = children['isProjectDelete'];
    }
    const state = useSelector((state) => state);
    let _projectList = state["workspaceSettings"]["projectList"];
    if (_projectList === undefined) { _projectList = []; }
    const _getKey = (item: any, index?: number): string => {
        return item.key;
    }
    const getProjectSettings = async (projectName: string, projectKey: string, _utils: Utils) => {
        return await _utils.GetProjectSettings(projectName, projectKey)
            .then(response => {
                return response;
            })
            .catch((error: Error) => {
                return false;
            });
    }
    const updateWorkspaceSettings = async (workspaceSettings: string, _utils: Utils) => {
        return await _utils.SaveContent(workspaceSettings, 'workspace/workspace.json')
            .then(response => {
                return response;
            })
            .catch((error: Error) => {
                return false;
            });
    }
    /**
     * 
     * @param event 
    */
    const openProject = (event: any): void => {
        const _utils = new Utils();
        getProjectSettings(event.currentTarget.name, event.currentTarget.id, _utils).then(content => {
            if (!content) {
                console.log('unable to retrieve the selected project data')
            }
            state['workspaceSettings']['deleteProjectReferral'] = false;
            state['workspaceSettings']['activeProject'] = content['name'];
            state['workspaceSettings']['activeProjectId'] = content['key'];
            updateWorkspaceSettings(state['workspaceSettings'], _utils).then(content => {
                if (!content) {
                    console.log('unable to retrieve the selected project data')
                } else {
                    window.location.reload();
                }
            });
        });
    }
    /**
     * 
     * @param ev 
     * @param column 
    */
    const _onColumnClick = (ev: React.MouseEvent<HTMLElement>, column: IColumn): void => {
        const _columns = projectState.columns;
        let _items = projectState.items
        if (!_items) {
            _items = _projectList;
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
        setProjectState((prev) => {
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
            name: 'Project Folder',
            ariaLabel: 'Column operations for File type',
            isIconOnly: true,
            minWidth: 10,
            maxWidth: 15,
            isPadded: false,
            onRender: () => (
                <FontIcon aria-label="Select the project to delete" iconName="FabricFolder" title="Select project" />
            ),
        },
        {
            key: 'col2',
            name: 'projects',
            fieldName: 'name',
            minWidth: 100,
            maxWidth: 160,
            isRowHeader: true,
            isResizable: true,
            isSorted: true,
            isSortedDescending: false,
            sortAscendingAriaLabel: 'Sorted A to Z',
            sortDescendingAriaLabel: 'Sorted Z to A',
            data: 'string',
            isPadded: false,
            onColumnClick: _onColumnClick,
            onRenderHeader: () => {
                return (
                    <TooltipHost content='Sort by project name'>
                        Projects
                    </TooltipHost >
                )
            },
            onRender: (item: any) => {
                return (
                    <TooltipHost content='Select the project to delete'>
                        {
                            isProjectDelete === false ? (
                                <Link onClick={openProject} id={item?.key} name={item?.name}>
                                    <Text variant={"medium"}>{item?.name}</Text>
                                </Link>
                            ) : (
                                <Text variant={"medium"}>{item?.name}</Text>
                            )
                        }
                    </TooltipHost >
                )
            },
        },
    ];
    useEffect(() => {
        let isMounted = true;
        (async () => {
            if (isMounted) {
                const _utils = new Utils();
                _utils.GetWorkspaceSettings().then(workspace => {
                    if (workspace && workspace.projectList) {
                        setProjectState((prev) => {
                            return { ...prev, items: workspace.projectList };
                        })
                    }
                });
            }
        })();
        return () => {
            isMounted = false;
        }
    }, [_projectList]);
    const [projectState, setProjectState] = useState({
        items: _projectList,
        columns: columns,
    });
    let _selectionMode: number;
    if (isProjectDelete) {
        _selectionMode = SelectionMode.single;
    } else {
        _selectionMode = SelectionMode.none;
    }
    let _selection: Selection;
    _selection = new Selection({
        onSelectionChanged: () => {
            if (isProjectDelete) {
                let projectInfo = {} as IProjectPair;
                if (_selection.getSelection() && _selection.getSelection().length > 0) {
                    projectInfo.key = _selection.getSelection()[0]['key'].toString();
                    projectInfo.name = _selection.getSelection()[0]['name'].toString();
                    dispatch({ type: 'CONFIRM_DELETE_PROJECT_INFO', payload: projectInfo });
                }
                else {
                    dispatch({ type: 'CONFIRM_DELETE_PROJECT_INFO', payload: projectInfo });
                }
            }
        },
    });

    return (
        <div>
            <DetailsList
                items={projectState?.items}
                compact={true}
                columns={projectState.columns}
                selectionMode={_selectionMode}
                getKey={_getKey}
                setKey="single"
                layoutMode={DetailsListLayoutMode.justified}
                isHeaderVisible={true}
                selection={_selection}
                selectionPreservedOnEmptyClick={true}
                enterModalSelectionOnTouch={true}
                className="cohortListStyle"
            />
        </div>
    )
}