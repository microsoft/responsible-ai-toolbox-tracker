// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React, { useState } from 'react';
import { Contents } from '@jupyterlab/services';
import { Label } from '@fluentui/react/lib/Label';
import { useSelector, useDispatch } from 'react-redux';
import { Spinner, SpinnerSize } from '@fluentui/react/lib/Spinner';
import { PrimaryButton, DefaultButton } from '@fluentui/react/lib/Button';
import { Dialog, DialogType, DialogFooter } from '@fluentui/react/lib/Dialog';
import { Utils } from '../../../core/utils';
import { removeCohortFromList } from './cohortUtils';

export const DeleteCohort: React.FunctionComponent = (props) => {
  /**
   * retrieve the app state.
  */
  const dispatch = useDispatch();
  const state = useSelector((state) => state);
  const projectSettings = state['projectSettings'];
  const showDialog = state['cohortDeleteDialogHiddenState'];
  const projectName = projectSettings['name'];
  let cohortKey = '';
  let cohortName = '';
  let cohortsList: any;
  const children = props.children;
  if (children) {
    cohortKey = children['cohortKey'];
    cohortName = children['cohortName'];
    cohortsList = children['cohortsList'];
  }
  let [waitSpinner, setWaitSpinner] = useState(false);
  /**
   * New cohort default settings.
  */
  const modelProps = {
    isBlocking: false,
    styles: { main: { maxWidth: 450 } },
  };
  const dialogContentProps = {
    type: DialogType.largeHeader,
    title: 'Confirm delete',
  };
  /**
  * Update the project settings.
  */
  const _updateProjectSettings = async (cohorts: any, notebooks: any, _utils: Utils): Promise<Contents.IModel> => {
    return _utils.UpdateProjectSettings(projectSettings, undefined, undefined, undefined, undefined, cohorts, undefined, notebooks).then(resp => {
      return resp;
    }).catch((error) => {
      return undefined;
    });
  }
  /**
   * Confirm delete request.
  */
  const confirmDelete = () => {
    setWaitSpinner(true);
    let _utils = new Utils();
    _utils.deleteCohort(projectName, cohortKey).then(content => {
      let selectedCohortsKeys = state['projectSettings']['selectedCohorts'];
      const datasets = projectSettings['datasets'];
      let ent: any[] = [];
      for (let i = 0; i < datasets?.length; i++) {
        if (datasets[i].key !== cohortKey) {
          ent.push(datasets[i]);
        }
        else {
          /**
           * update the selected cohort list.
          */
          const index = selectedCohortsKeys.indexOf(datasets[i].name, 0);
          if (index !== -1) {
            selectedCohortsKeys.splice(index, 1);
          }
        }
      }
      dispatch({ type: 'SELECTED_COHORTS_VISUAL', payload: selectedCohortsKeys });
      const notebooks = projectSettings['notebooks'];
      for (let i = 0; i < notebooks?.length; i++) {
        for (let j = 0; j < notebooks[i]?.metrics?.length; j++) {
          if (notebooks[i].metrics[j].key === cohortKey) {
            notebooks[i].metrics.splice(j, 1);
          }
        }
      }
      _updateProjectSettings(ent, notebooks, _utils).then(content => {
        if (content) {
          removeCohortFromList(cohortsList, cohortKey).then(list => {
            if (list) {
              dispatch({ type: 'UPDATE_COHORT_SETTINGS_LIST', payload: list });
              dispatch({ type: 'COHORT_DELETE_DIALOG_STATE', payload: true });
              setWaitSpinner(false);
            }
            else {
              setWaitSpinner(false);
              //todo: raise an error
              console.log("Cohort was NOT removed form cohortList: " + JSON.stringify(cohortsList));
            }
          });
        } else {
          setWaitSpinner(false);
        }
      });
    }).catch((error) => {
      setWaitSpinner(false);
      throw error;
    });
  }
  const onDismiss = () => {
    dispatch({ type: 'COHORT_DELETE_DIALOG_STATE', payload: true });
  }
  return (
    <Dialog
      hidden={showDialog}
      onDismiss={onDismiss}
      dialogContentProps={dialogContentProps}
      modalProps={modelProps}
    >
      <div className='deleteDialog'>
        <div>
          <Label className="deleteDialogLabel">
            Are you sure you want to permanently delete this cohort and all its resources? <br /><b>{cohortName}</b>
          </Label>
        </div>
        <div>
          {waitSpinner ? (<Spinner size={SpinnerSize.medium} label="Deleting all cohort resources, please wait..." ariaLive="assertive" labelPosition="bottom" />) : (
            <></>
          )}
        </div>
      </div>
      <DialogFooter>
        <PrimaryButton secondaryText="Confirm cohort delete" onClick={confirmDelete} text="Confirm" />
        <DefaultButton onClick={onDismiss} text="Cancel" />
      </DialogFooter>
    </Dialog>
  );
}
