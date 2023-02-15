import * as React from 'react';
import { CreateCohort } from "./createCohort";
import { useSelector, useDispatch } from 'react-redux';
import { Panel, PanelType } from '@fluentui/react/lib/Panel';
import { EditCohort } from "./editCohort";


export const CohortManager: React.FunctionComponent = () => {
  const state = useSelector((state) => state);
  let isCreateOpen = state['createCohortPanelState'];
  let isEditOpen = state['editCohortPanelState'];
  /**
   * Dismiss cohort panel
  */
  const dispatch = useDispatch();
  const dismissPanel = (): void => {
    dispatch({ type: 'COHORT_CREATE_PANEL_STATE', payload: false });
  };
  let createCohortHeader = "Create new cohort";
  let editCohortHeader = "Edit cohort";

  return (
    <div>
      <div>
        <Panel
          isOpen={isCreateOpen}
          headerText={createCohortHeader}
          onDismiss={dismissPanel}
          closeButtonAriaLabel="Close"
          type={PanelType.custom}
          customWidth='360px'
        >
          <CreateCohort />
        </Panel>

      </div>
      <div>
        <Panel
          isOpen={isEditOpen}
          headerText={editCohortHeader}
          onDismiss={dismissPanel}
          closeButtonAriaLabel="Close"
          type={PanelType.custom}
          customWidth='360px'
        >
          <EditCohort />
        </Panel>
      </div>
    </div>
    
  );
}