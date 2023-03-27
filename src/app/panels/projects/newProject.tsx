// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React from 'react';
import { IIconProps } from '@fluentui/react';
import { Label } from '@fluentui/react/lib/Label';
import { NewProjectModal } from './newProjectModal';
import { useDispatch, useSelector } from 'react-redux';
import { PrimaryButton } from '@fluentui/react/lib/Button';
import { ImportNotebook } from '../notebook/importNotebook';
import { ProjectList } from './projectList';
import { OpenProject } from './openProject';
export const NewProject: React.FunctionComponent = () => {
  const dispatch = useDispatch();
  const state = useSelector((state) => state);
  let projectList = state["workspaceSettings"]["projectList"];
  let projectsHidden: boolean = true;
  if (projectList || projectList?.length > 0) {
    projectsHidden = false;
  }
  const openNewProject = () => {
    dispatch({ type: 'NEW_PROJECT_MODAL_STATE', payload: true });
  };
  const switchProject = () => {
    dispatch({ type: 'SWITCH_PROJECT_MODAL_STATE', payload: false });
  };
  const newFolderIcon: IIconProps = { iconName: 'FabricNewFolder', className: 'newProjectIcon' };
  const fabricFolder: IIconProps = { iconName: 'FabricFolder', className: 'newProjectIcon' };
  return (
    <div className="marginLeft">
      <table className='dataTable'>
        <tbody>
          <tr>
            <td>
              <PrimaryButton iconProps={newFolderIcon} onClick={openNewProject} className="btnNewProject" text="Create a New project" />
            </td>
          </tr>
          <tr>
            <td>
              <div hidden={projectsHidden}>
                <PrimaryButton iconProps={fabricFolder} onClick={switchProject} className="btnNewProject" text="Open a project" />
              </div>
            </td>
          </tr>
          <tr>
            <td>
              <Label className="cohortBodyLabel">
                Responsible AI Tracker is a JupyterLab Extension for managing, tracking, and comparing results of machine learning experiments for model improvement.
              </Label>
            </td>
          </tr>
          <tr>
            <td>
              <Label className="cohortBodyLabel">
                Using this extension, data scientists can view models, code, and visualization artifacts within the same framework enabling therefore responsible and fast
                model iteration and evaluation.
              </Label>
            </td>
          </tr>
          <tr>
            <td>
              &nbsp;
            </td>
          </tr>
          <tr>
            <td>
              <div hidden={projectsHidden}><ProjectList /></div>
            </td>
          </tr>
        </tbody>
      </table>
      <NewProjectModal />
      <OpenProject />
      <ImportNotebook />
    </div >
  );
};



