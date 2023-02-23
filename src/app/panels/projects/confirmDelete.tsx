// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React from 'react';
import { PathExt } from '@jupyterlab/coreutils';
import { Label } from '@fluentui/react/lib/Label';
import { useSelector, useDispatch } from 'react-redux';
import { PrimaryButton, DefaultButton } from '@fluentui/react/lib/Button';
import { Dialog, DialogType, DialogFooter } from '@fluentui/react/lib/Dialog';
import { Utils } from '../../../core/utils';
import { FontIcon } from '@fluentui/react/lib/Icon';
import { deleteProjectResources } from '../../../core/mlflowUtils';

export const ConfirmDelete: React.FunctionComponent = () => {
    const WORKSPACE_DIR = 'workspace';
    /**
     * retrieve the app state.
    */
    const dispatch = useDispatch();
    const state = useSelector((state) => state);
    let workspaceSettings = state['workspaceSettings'];
    const showDialog = state['confirmDeleteProjectModalState'];
    let confirmDeleteProjectInfo = state['confirmDeleteProjectInfo'];
    let projectKey = confirmDeleteProjectInfo['key'];
    let projectName = confirmDeleteProjectInfo['name'];
    const modalPropsStyles = { main: { maxWidth: 450 }, align: 'top', dialogDefaultMaxWidth: 450 };
    /**
     * dialog default settings.
    */
    const modelProps = {
        isBlocking: false,
        styles: modalPropsStyles,
        topOffsetFixed: true,
    };

    const dialogContentProps = {
        type: DialogType.close,
        title: <>Delete confirmation<FontIcon aria-label="warning" iconName="warning" className="confirmDeleteWarning" /></>,
    };
    /**
     * Update the client workspace settings.
     * @param projectsList 
     * @returns 
    */
    const updateWorkspaceSettings = async (projectsList: any[]): Promise<void> => {
        let _utils = new Utils();
        if (projectsList.length === 0) {
            _utils.resetWorkspaceSettings().then(resp => {
            }).catch((error: Error) => {
                console.log(error.message);
            });
        } else {
            if (workspaceSettings['activeProjectId'] === projectKey) {
                for (let i = 0; i < projectsList?.length; i++) {
                    state['workspaceSettings']['activeProjectId'] = projectsList[i].key;
                    state['workspaceSettings']['activeProject'] = projectsList[i].name;
                    break;
                }
            }
            state['workspaceSettings']['deleteProjectReferral'] = true;
            await _utils.SaveContent(state['workspaceSettings'], 'workspace/workspace.json').then(resp => {
                if (resp) {
                    console.log('Succeeded in updating workspace.')
                } else {
                    console.log('failed to update workspace.')
                }
            }).catch((error: Error) => {
                console.log(error.message);
            });
        }
    }
    /**
     * Confirm delete request.
    */
    const confirmDelete = async () => {
        /**
         * Update the projects list.
        */
        let project = {};
        let projectsList = [];
        for (let i = 0; i < workspaceSettings['projectList']?.length; i++) {
            project['key'] = workspaceSettings['projectList'][i].key;
            project['name'] = workspaceSettings['projectList'][i].name;
            if (projectKey !== project['key']) {
                projectsList.push(project);
                project = {};
            }
        }
        workspaceSettings['projectList'] = projectsList;

        const projectDir = PathExt.join(WORKSPACE_DIR, projectName);
        deleteProjectResources(projectDir).then(resp => {
            if (resp) {
                updateWorkspaceSettings(projectsList).then(resp => {
                    dispatch({ type: 'CONFIRM_DELETE_PROJECT_MODAL_STATE', payload: true });
                    window.location.reload();
                }).catch((error: Error) => {
                    console.log(error.message);
                });
            }
        }).catch((error: Error) => {
            console.log(error.message);
        });
    }
    /**
     * dismiss the delete popup.
    */
    const onDismiss = () => {
        dispatch({ type: 'CONFIRM_DELETE_PROJECT_MODAL_STATE', payload: true });
    }
    return (
        <Dialog
            hidden={showDialog}
            onDismiss={onDismiss}
            dialogContentProps={dialogContentProps}
            modalProps={modelProps}
        >
            <Label className='confirmDeleteStyle'>
                Are you sure you want to permanently delete this project? &nbsp;&nbsp;<b>{projectName}</b>
                <br />
                <br />
                Once deleted, all project resources and artifacts will be removed from your device.
                <br />
                <br />
            </Label>
            <DialogFooter>
                <PrimaryButton onClick={confirmDelete} text="Confirm" />
                <DefaultButton onClick={onDismiss} text="Cancel" />
            </DialogFooter>
        </Dialog>
    );
}
