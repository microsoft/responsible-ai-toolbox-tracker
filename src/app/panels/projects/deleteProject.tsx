// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { PrimaryButton, DefaultButton } from '@fluentui/react/lib/Button';
import { Dialog, DialogType, DialogFooter } from '@fluentui/react/lib/Dialog';
import { Utils } from '../../../core/utils';
import { FontIcon } from '@fluentui/react/lib/Icon';
import { ProjectList } from './projectList';


export const DeleteProject: React.FunctionComponent = () => {  
    /**
     * retrieve the app state.
    */
    const dispatch = useDispatch();
    const state = useSelector((state) => state);
    const showDialog = state['deleteProjectModalState'];
    let confirmDeleteProjectInfo = state['confirmDeleteProjectInfo'];
    let projectKey = confirmDeleteProjectInfo['key'];
    let projectName = confirmDeleteProjectInfo['name'];

    const modalPropsStyles = { main: { maxWidth: 450, minWidth: 400 } };

    let [submitDisabled, setSubmitDisabled] = useState(true);
    useEffect(() => {
        if (projectKey?.length > 0 && projectName?.length > 0) {
            setSubmitDisabled(false);
        } else {
            setSubmitDisabled(true);
        }
    }, [projectKey, projectName]);
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
        title: <>Delete a project<FontIcon aria-label="warning" iconName="warning" className="confirmDeleteWarning" /></>,
        subText: 'Select a project to delete, and click confirm.',
    }; 
    /**
     * Confirm delete request.
    */
    const confirmDelete = async () => {
        dispatch({ type: 'CONFIRM_DELETE_PROJECT_MODAL_STATE', payload: true });
        dispatch({ type: 'DELETE_PROJECT_MODAL_STATE', payload: true });
    }
    /**
     * dismiss the delete popup.
    */
    const onDismiss = () => {
        dispatch({ type: 'DELETE_PROJECT_MODAL_STATE', payload: true });
    }
    let projectDeleteState = {
        isProjectDelete: true,
    };

    return (
        <Dialog
            hidden={showDialog}
            onDismiss={onDismiss}
            dialogContentProps={dialogContentProps}
            modalProps={modelProps}
        >
            <div className='scrollableList'>
                <ProjectList children={projectDeleteState} />
            </div>
            <DialogFooter>
                <PrimaryButton onClick={confirmDelete} text="Confirm" disabled={submitDisabled} />
                <DefaultButton onClick={onDismiss} text="Cancel" />
            </DialogFooter>
        </Dialog>
    );
}
