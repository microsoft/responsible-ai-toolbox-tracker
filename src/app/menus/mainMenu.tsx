// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React from 'react';
import { useConst } from '@fluentui/react-hooks';
import { INotebookType } from '../../core/components';
import { useSelector, useDispatch } from 'react-redux';
import { IconButton } from '@fluentui/react/lib/Button';
import { NotebookUtils } from '../../core/notebookUtils';
import {
    ContextualMenuItemType,
    IContextualMenuProps
} from '@fluentui/react/lib/ContextualMenu';

export const MainMenu: React.FunctionComponent = () => {
    const dispatch = useDispatch();
    const state = useSelector((state) => state);
    let workspaceSettings = state['workspaceSettings'];
    let disabledMenuItem = false;
    let disabledOpenProjectItem = false;
    if (state['projectSettings']['name'] !== undefined
        && state['projectSettings']['name'].length > 0
        && workspaceSettings['deleteProjectReferral'] === false) {
        disabledMenuItem = false;
        disabledOpenProjectItem = false;
    } else if (!workspaceSettings) {
        disabledMenuItem = true;
        disabledOpenProjectItem = true;
    } else {
        disabledMenuItem = true;
        if (workspaceSettings['deleteProjectReferral'] === true) {
            disabledOpenProjectItem = false;
        } else {
            disabledOpenProjectItem = true;
        }
    }
    /**
     * 
     * @param projectName 
     * @param projectId 
     * @param serverUri 
     * @returns 
    */
    const _createNewNotebook = (projectName: string = undefined, projectId: string = undefined, serverUri: string = undefined, notebookUtils: NotebookUtils = undefined): Promise<INotebookType> => {
        return notebookUtils.CreateNewNotebook(projectName, projectId, serverUri)
            .then(response => {
                return response;
            })
            .catch((error: Error) => {
                return undefined;
            })
    }
    /**
     * 
    */
    const CreateNewNotebook = () => {
        const notebookUtils = new NotebookUtils();
        const projectName = state['workspaceSettings']['activeProject'];
        const projectId = state['workspaceSettings']['activeProjectId'];
        const notebookList = state['projectSettings']['notebooks'];
        const serverUri = state['serverUri'];

        let notebooks: any[] = [];
        if (notebookList) {
            notebooks = JSON.parse(JSON.stringify(notebookList));
        }
        _createNewNotebook(projectName, projectId, serverUri, notebookUtils).then(
            notebook => {
                /**
                 * Update notebooks.
                */
                notebooks.push(notebook);
                dispatch({ type: 'REFRESH_NOTEBOOK_LIST', payload: notebooks });
                notebookUtils.FocusNewNotebook(projectName, projectId, notebook, notebooks)
                    .then(content => {
                        if (content) {                          
                            notebook.name = content.notebook.name;
                            /**
                             * Update notebooks if file was renamed.
                            */
                            let index = notebooks.indexOf(notebook);
                            if (index !== -1) {
                                notebooks[index] = notebook;
                            } else {
                                console.log("Error creating a new notebook.")
                            }
                            dispatch({ type: 'REFRESH_NOTEBOOK_LIST', payload: notebooks });
                        }
                    });
            }
        );
    };
    const createNewProject = () => {
        dispatch({ type: 'NEW_PROJECT_MODAL_STATE', payload: true });
    };
    const deleteProject = () => {
        dispatch({ type: 'DELETE_PROJECT_MODAL_STATE', payload: true });
    };
    const switchProject = () => {
        dispatch({ type: 'SWITCH_PROJECT_MODAL_STATE', payload: false });
    };
    const importNotebook = () => {
        dispatch({ type: 'IMPORT_NOTEBOOK_MODAL_STATE', payload: true });

    };
    // @ts-ignore
    const menuProps: IContextualMenuProps = useConst({
        shouldFocusOnMount: true,
        items: [
            // @ts-ignore
            { key: 'NewProject', iconProps: { iconName: 'FabricNewFolder', className: 'mainMenuClass' }, text: 'New Project', onClick: () => createNewProject() },
            { key: 'OpenProject', iconProps: { iconName: 'FabricOpenFolderHorizontal', className: 'mainMenuClass' }, text: 'Open a Project', disabled: disabledOpenProjectItem, onClick: () => switchProject() },
            { key: 'DeleteProject', iconProps: { iconName: 'FabricFolderFill', className: 'mainMenuClass' }, text: 'Delete Project', disabled: disabledMenuItem, onClick: () => deleteProject() },
            { key: 'divider_1', itemType: ContextualMenuItemType.Divider },
            { key: 'newNotebook', iconProps: { iconName: 'PageAdd', className: 'mainMenuClass' }, text: 'New Notebook', disabled: disabledMenuItem, onClick: () => CreateNewNotebook() },
            { key: 'importNotebook', iconProps: { iconName: 'Import', className: 'mainMenuClass' }, text: 'Import a Notebook', disabled: disabledMenuItem, onClick: () => importNotebook() },
            { key: 'divider_2', itemType: ContextualMenuItemType.Divider },
            { key: 'trackerHelp', text: 'Help', disabled: disabledMenuItem, href: 'https://responsible-ai-toolbox-tracker.readthedocs.io/en/latest/', target: '_blank' },
        ],
    });
    return <IconButton title='Responsible AI Tracker' name='mainMenuIcon' className='IconButtonStyle' menuIconProps={{ iconName: "GlobalNavButton" }} menuProps={menuProps} />
};
export const ContextualMenuMIF = () => <MainMenu />;
