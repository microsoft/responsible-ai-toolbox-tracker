// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import * as React from 'react';
import { Label } from '@fluentui/react/lib/Label';
import { useSelector, useDispatch } from 'react-redux';
import { DefaultButton } from '@fluentui/react/lib/Button';
import { Panel, PanelType } from '@fluentui/react/lib/Panel';
import '../../../../style/cohorts.css';
import { CohortList } from "./cohortList";
import { CohortManager } from "./cohortManager";

export const CohortSettings: React.FunctionComponent = () => {
  const dispatch = useDispatch();
  const state = useSelector((state) => state);
  let isSettingsOpen = state['cohortPanelState'];
  const dismissCohortPanel = (): void => {
    dispatch({ type: 'COHORT_SETTINGS_PANEL_STATE', payload: false });
  };
  const openCohortManagerPanel = (): void => {
    dispatch({ type: 'COHORT_CREATE_PANEL_STATE', payload: true });
  };
  const onRenderFooterContent = React.useCallback(
    () => (
      <div>
        <DefaultButton onClick={dismissCohortPanel} text="Close" />
      </div>
    ),
    [dismissCohortPanel],
  );
  const LOREM_IPSUM =
    'Cohorts are subsets of data created by manually adding filters to the overall test datasets. Creating cohorts enables disaggregated model analysis and comparison by including such cohorts in model comparison. '+
    'Disaggregated model comparison helps in understanding areas where new models perform better or worse than the baseline. ';

  return (
    <div className="cohortBody">
      <Panel
        isOpen={isSettingsOpen}
        onDismiss={dismissCohortPanel}
        headerText="Cohort settings"
        closeButtonAriaLabel="Close"
        onRenderFooterContent={onRenderFooterContent}
        isFooterAtBottom={true}
        isBlocking={false}
        type={PanelType.custom}
        customWidth='600px'
      >
        <Label className="cohortBodyLabel">{LOREM_IPSUM}</Label>
        <br />
        <DefaultButton onClick={openCohortManagerPanel} text="Create new cohort" />
        <br />
        <CohortList />
      </Panel>

      <CohortManager />
    </div>
  );
}