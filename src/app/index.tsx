// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import * as React from 'react';
import { Provider } from 'react-redux';
import { PanelContainer } from './panels';
import { ProjectInstance } from '../core/manager';
import { ReactWidget } from '@jupyterlab/apputils';
import { LabIcon } from '@jupyterlab/ui-components';
import { initializeIcons } from '@fluentui/react/lib/Icons';
initializeIcons();
/*
 * Icon for Client
*/
import trackerIcon from '../../style/img/trackerIcon.svg';
export const raiIcon = new LabIcon({
  name: 'rai',
  svgstr: trackerIcon,
});
/*
 * Shows the current rai client Instance
 */
export class raiUI extends ReactWidget {
  public activeInstance: ProjectInstance;
  constructor() {
    super();
    this.activeInstance = undefined;
    this.id = 'raiPanel';
    this.addClass('raiPanel');
    this.title.icon = raiIcon;
    this.title.iconClass = 'RAI Tracker';
    this.title.caption = 'Responsible AI Tracker';
    this.node.tabIndex = 0;
  }
  dispose() {
    if (this.isDisposed) {
      return;
    }
    this.activeInstance = null;
    super.dispose();
  }
  protected render() {
    if (this.activeInstance) {
      return (
        <Provider store={this.activeInstance.store}>
          <PanelContainer />
        </Provider>
      );
    }
  }
}

