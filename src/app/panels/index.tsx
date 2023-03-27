// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import * as React from 'react';
import { Stack } from '@fluentui/react/lib/Stack';
import { Label } from '@fluentui/react/lib/Label';
import { useSelector, useDispatch } from 'react-redux';
import { PrimaryButton } from '@fluentui/react/lib/Button';
import { ScrollablePane } from '@fluentui/react/lib/ScrollablePane';
import {
  TooltipHost,
  ITooltipHostStyles,
  ScrollbarVisibility
} from '@fluentui/react';
import { Utils } from '../../core/utils';
import { ContextualMenuMIF } from '../menus/mainMenu';
import { NewProject, ActiveProject } from './projects';

export const PanelContainer: React.FunctionComponent = () => {
  const state = useSelector((state) => state);
  const dispatch = useDispatch();

  const compareModels = () => {
    state['openCompareModels']();
    let projectSettings = state["projectSettings"];
    projectSettings['showCompareModels'] = true;
    dispatch({ type: 'PROJECT_SETTINGS', payload: projectSettings });
    /**
     * instantiate the util object.
    */
    const _utils = new Utils();
    _utils.UpdateBaseProjectSettings(projectSettings);
  }
  
  const hostStyles: Partial<ITooltipHostStyles> = {
    root: { display: 'inline-block', alignContent: 'left', verticalAlign: 'center' }
  };
  const tooltipCompareModelsBtn = 'tooltipCompareModelsBtn';
  return (
    <>
      <Stack grow >
        <Stack.Item
          verticalFill
          styles={{
            root: {
              height: "100%",
              overflowY: "auto",
              overflowX: "auto",
            },
          }}
        >
          <div className="ScrollablePaneWrapper" >
            <ScrollablePane scrollbarVisibility={ScrollbarVisibility.auto}>
              <div>
                <table className='raiPanel'>
                  <tbody>
                    <tr className='mifHeader'>
                      <td className='mainMenu'>
                        <ContextualMenuMIF />
                      </td>
                      <td colSpan={2}>
                        <Label className='mifLabel'>Responsible AI Tracker</Label>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={3}>
                        {
                          state['projectSettings']['name'] !== undefined && state['workspaceSettings']['deleteProjectReferral'] === false ? (
                            <ActiveProject />
                          ) : (
                            <NewProject />
                          )
                        }
                      </td>
                    </tr>
                    <tr><td colSpan={3}>&nbsp;</td></tr>
                  </tbody>
                </table>
              </div>
            </ScrollablePane>
          </div>
        </Stack.Item>
        {
          state['projectSettings']['name'] !== undefined && state['workspaceSettings']['deleteProjectReferral'] === false ? (
            <Stack.Item align="center" className="stickyFooter">
              {
                state['projectSettings']['enableCompareModelBtn'] ? (
                  <PrimaryButton onClick={compareModels} className="btnCompareModels" text="Compare models" />
                ) : (

                  <TooltipHost content='Register two or more models to enable the compare models feature.' id={tooltipCompareModelsBtn} styles={hostStyles}>
                    <PrimaryButton onClick={compareModels} className="btnCompareModels" text="Compare models" disabled={true} />
                  </TooltipHost>
                )
              }

            </Stack.Item>
          ) : (
            <></>
          )
        }
      </Stack>
    </>
  );
}
