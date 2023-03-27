// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import * as React from 'react';
import { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { DefaultButton } from '@fluentui/react/lib/Button';
import { IChoiceGroupOption } from '@fluentui/react/lib/ChoiceGroup';
import {
    Dialog,
    DialogType,
    DialogFooter
} from '@fluentui/react/lib/Dialog';
import { ProjectList } from './projectList';

export const OpenProject: React.FunctionComponent = () => {
    const options: IChoiceGroupOption[] = [];
    const modalPropsStyles = { main: { maxWidth: 450 }, align: 'center' };
    const dialogContentProps = {
        type: DialogType.normal,
        title: 'Open a Project',
        subText: 'Click on the project name to open it.',
    };
    const modalProps = useMemo(
        () => ({
            isBlocking: true,
            styles: modalPropsStyles,
            dragOptions: undefined,
        }),
        [],
    );
    const dispatch = useDispatch();
    const state = useSelector((state) => state);
    const showModal = state['switchProjectModalState'];
    /**
     * Build the project list.
    */
    for (let i = 0; i < state['workspaceSettings']['projectList']?.length; i++) {
        let ent = {} as IChoiceGroupOption;
        ent.key = state['workspaceSettings']['projectList'][i].key;
        ent.text = state['workspaceSettings']['projectList'][i].name;
        options.push(ent);
    }
    const handleClose = () => {
        dispatch({ type: 'SWITCH_PROJECT_MODAL_STATE', payload: false });
    }
    return (
        <>
            <Dialog
                hidden={showModal}
                onDismiss={handleClose}
                dialogContentProps={dialogContentProps}
                modalProps={modalProps}
            >
                <div className='scrollableList'>
                    <ProjectList />
                </div>
                <DialogFooter>
                    <DefaultButton onClick={handleClose} text="Cancel" />
                </DialogFooter>
            </Dialog>
        </>
    );
};