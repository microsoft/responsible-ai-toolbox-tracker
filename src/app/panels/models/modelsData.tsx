// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React from 'react';
import { useState, useEffect } from 'react';
import { ColorSelector } from './colorSelector';
import { Stack } from '@fluentui/react/lib/Stack';
import { Toggle } from '@fluentui/react/lib/Toggle';
import { useSelector, useDispatch } from 'react-redux';
import { FontIcon, Icon } from '@fluentui/react/lib/Icon';
import { TooltipHost, ITooltipHostStyles, Link } from '@fluentui/react';
import { ChoiceGroup, IChoiceGroupOption } from '@fluentui/react/lib/ChoiceGroup';
import { Dropdown, DropdownMenuItemType, IDropdownStyles, IDropdownOption } from '@fluentui/react/lib/Dropdown';
import { Absolute } from './absolute';
import { Comparative } from './comparative';
import { Utils } from '../../../core/utils';
import { CohortSettings } from '../cohorts';
import { getModelsStats } from './modelsUtils'

export const ModelsData: React.FunctionComponent = () => {
  /**
   * retrieve the app state.
  */
  const dispatch = useDispatch();
  const state = useSelector((state) => state);
  const projectSettings = state['projectSettings'];
  const datasetList = projectSettings['datasets'];
  const notebookList = projectSettings['notebooks'];
  let selectedModelKeys = projectSettings['selectedModels'];
  let selectedMetricKeys = projectSettings['selectedMetrics'];
  let selectedCohortsKeys = projectSettings['selectedCohorts'];
  let toggleVisualDisplay = projectSettings['toggleVisualDisplay'];
  let absoluteVisualDisplay = projectSettings['absoluteVisualDisplay'];
  let baselineVisualDisplay = projectSettings['baselineVisualDisplay'];
  const baseNotebookModelKey = projectSettings['baseNotebookModelKey'];
  let [_toggleVisualDisplay, setToggleVisualDisplay] = useState(true);
  const [selectedKeyChoice, setSelectedKeyChoice] = useState('_comparative');
  const [choiceOptions, setChoiceOptions] = useState<IChoiceGroupOption[]>();

  useEffect(() => {
    let isMounted = true;
    (async () => {
      if (isMounted) {

        const _options: IChoiceGroupOption[] = [];
        let ent = {} as IChoiceGroupOption;
        ent.key = '_absolute';
        ent.text = 'Absolute';
        _options.push(ent);
        ent = {} as IChoiceGroupOption;
        ent.key = '_comparative';
        ent.text = 'Comparative';
        _options.push(ent);

        setChoiceOptions(_options);

        if (absoluteVisualDisplay === true) {
          setSelectedKeyChoice('_absolute');
        } else {
          setSelectedKeyChoice('_comparative');
        }

        if (toggleVisualDisplay === true) {
          setToggleVisualDisplay(true);
        } else {
          setToggleVisualDisplay(false);
        }
      }
    })();
    return () => {
      isMounted = false;
    }
  }, [notebookList]);
  /**
   * view settings
   */
  let absoluteHidden = false;
  let comparativeHidden = false;
  if (absoluteVisualDisplay === true) {
    absoluteHidden = false;
    comparativeHidden = true;
  } else {
    absoluteHidden = true;
    comparativeHidden = false;
  }
  if (baselineVisualDisplay === true) {
    comparativeHidden = false;
    absoluteHidden = true;
  }
  else {
    comparativeHidden = true;
    absoluteHidden = false;
  }
  /**
   * get the model data.
  */
  let [modelsStatsList, metricHeaders, cohortOptions, notebookOptions] = getModelsStats(datasetList, notebookList, baseNotebookModelKey, selectedModelKeys);
  /**
   * Build Metrics options.
  */
  const buildMetricsOptions = (): void => {
    for (let k in metricHeaders) {
      let item = metricHeaders[k];

      if (selectedMetricKeys.indexOf(item.text) !== -1) {
        metricHeaders[k].selected = true;
      }
    }
  }
  /**
   * Account for metric headers changes.
  */
  useEffect(() => {
    buildMetricsOptions();
  }, [metricHeaders]);
  /**
   * Build Cohort options.
  */
  const buildCohortOptions = (): void => {
    for (let k in cohortOptions) {
      if (k === '' || k === null || k === undefined) { continue; }
      let item = cohortOptions[k];
      if (selectedCohortsKeys?.indexOf(item.text) === -1) {
        cohortOptions[k].selected = false;
      }
      else {
        cohortOptions[k].selected = true;
      }
    }
  }
  /**
   * Account for cohort selection changes.
  */
  useEffect(() => {
    buildCohortOptions();
  }, [cohortOptions]);
  /**
   * Build notebooks options.
  */
  const buildNotebookOptions = (): void => {
    for (let k in notebookOptions) {
      let item = notebookOptions[k];

      if (selectedModelKeys?.indexOf(item.key) === -1) {
        notebookOptions[k].selected = false;
      }
      else {
        notebookOptions[k].selected = true;
      }
    }
  }
  /**
   * Account for notebook selection changes.
  */
  useEffect(() => {
    buildNotebookOptions();
  }, [notebookOptions]);
  /**
   * Update the compare models metrics settings.
   * @param toggleVisualDisplay 
   * @param absoluteVisualDisplay 
   * @param baselineVisualDisplay 
   * @param baseNotebookModel 
   * @param baseNotebookModelKey 
   * @returns 
   */
  const updateSelectedMetrics = async (toggleVisualDisplay: boolean = undefined, absoluteVisualDisplay: boolean = undefined, baselineVisualDisplay: boolean = undefined, baseNotebookModel: string = undefined, baseNotebookModelKey: string = undefined) => {
    const _utils = new Utils();
    return _utils.UpdateCompareModelsSettings(projectSettings, baseNotebookModel, baseNotebookModelKey, toggleVisualDisplay, absoluteVisualDisplay, baselineVisualDisplay, selectedMetricKeys)
      .then(response => {
        return response;
      })
      .catch((error: Error) => {
        return false;
      });
  }
  /**
   * Update metrics selections.
   * @param event 
   * @param item 
  */
  const updateMetrics = (event: React.FormEvent<HTMLDivElement>, item: IDropdownOption): void => {
    if (item) {
      if (item.selected) {
        if (selectedMetricKeys.indexOf(item.text) === -1) {
          selectedMetricKeys.push(item.text);
        }
      } else {
        const index = selectedMetricKeys.indexOf(item.text, 0);
        if (index > -1) {
          selectedMetricKeys.splice(index, 1);
        }
      }
      updateSelectedMetrics();
      dispatch({ type: 'SELECTED_METRICS_VISUAL', payload: selectedMetricKeys });
    }
  }
  /**
   * Update the compare models 'models' settings.
   * @param toggleVisualDisplay 
   * @param absoluteVisualDisplay 
   * @param baselineVisualDisplay 
   * @param baseNotebookModel 
   * @param baseNotebookModelKey 
   * @returns 
  */
  const updateSelectedModels = async (toggleVisualDisplay: boolean = undefined, absoluteVisualDisplay: boolean = undefined, baselineVisualDisplay: boolean = undefined, baseNotebookModel: string = undefined, baseNotebookModelKey: string = undefined) => {
    const _utils = new Utils();
    return _utils.UpdateCompareModelsSettings(projectSettings, baseNotebookModel, baseNotebookModelKey, toggleVisualDisplay, absoluteVisualDisplay, baselineVisualDisplay, selectedMetricKeys, selectedModelKeys)
      .then(response => {
        return response;
      })
      .catch((error: Error) => {
        return false;
      });
  }
  /**
   * Update models selections.
   * @param event 
   * @param item 
  */
  const updateModels = (event: React.FormEvent<HTMLDivElement>, item: IDropdownOption): void => {
    if (item) {
      if (item.selected) {
        if (selectedModelKeys.indexOf(item.text) === -1) {
          selectedModelKeys.push(item.text);
        }
      } else {
        const index = selectedModelKeys.indexOf(item.text, 0);
        if (index !== -1) {
          selectedModelKeys.splice(index, 1);
        }
      }
      updateSelectedModels();
      dispatch({ type: 'SELECTED_MODELS_VISUAL', payload: selectedModelKeys });
    }
  }
  /**
   * Update the compare models cohorts settings.
   * @param toggleVisualDisplay 
   * @param absoluteVisualDisplay 
   * @param baselineVisualDisplay 
   * @param baseNotebookModel 
   * @param baseNotebookModelKey 
   * @returns 
  */
  const updateSelectedCohorts = async (toggleVisualDisplay: boolean = undefined, absoluteVisualDisplay: boolean = undefined, baselineVisualDisplay: boolean = undefined, baseNotebookModel: string = undefined, baseNotebookModelKey: string = undefined) => {
    const _utils = new Utils();
    return _utils.UpdateCompareModelsSettings(projectSettings, baseNotebookModel, baseNotebookModelKey, toggleVisualDisplay, absoluteVisualDisplay, baselineVisualDisplay, selectedMetricKeys, selectedModelKeys, selectedCohortsKeys)
      .then(response => {
        return response;
      })
      .catch((error: Error) => {
        return false;
      });
  }
  /**
   * Update cohorts selections.
   * @param event 
   * @param item 
  */
  const updateCohorts = (event: React.FormEvent<HTMLDivElement>, item: IDropdownOption): void => {
    if (item) {
      if (item.selected) {
        if (selectedCohortsKeys?.indexOf(item.text) === -1) {
          selectedCohortsKeys.push(item.text);
        }
      } else {
        const index = selectedCohortsKeys?.indexOf(item.text, 0);
        if (index > -1) {
          selectedCohortsKeys.splice(index, 1);
        }
      }
      updateSelectedCohorts();
      dispatch({ type: 'SELECTED_COHORTS_VISUAL', payload: selectedCohortsKeys });
    }
  }
  /**
   * Open the cohort panel
  */
  const openCohortPanel = () => {
    dispatch({ type: 'COHORT_SETTINGS_PANEL_STATE', payload: true });
  }
  /**
   * 
   * @param option 
   * @returns 
  */
  const onRenderCohortOptions = (option: IDropdownOption): JSX.Element => {
    switch (option.itemType) {
      case DropdownMenuItemType.Header:
        return (
          <div className="selectCohortsFooter">
            {option.data && option.data.icon && (
              <Icon onClick={openCohortPanel} style={iconStyles} iconName={option.data.icon} aria-hidden="true" title={option.data.icon} />
            )}
            <span onClick={openCohortPanel}>{option.text}</span>
          </div>
        );
      default:
        return (
          <div>
            <span>&nbsp;{option.text}</span>
          </div>
        );
    }
  }
  /**
   * Update the settings for the models absolute values heatmap
   * @param toggleVisualDisplay 
   * @param absoluteVisualDisplay 
   * @param baselineVisualDisplay 
   * @param baseNotebookModel 
   * @param baseNotebookModelKey 
   * @returns 
  */
  const compareModelsVisual = async (toggleVisualDisplay: boolean = undefined, absoluteVisualDisplay: boolean = undefined, baselineVisualDisplay: boolean = undefined, baseNotebookModel: string = undefined, baseNotebookModelKey: string = undefined) => {
    const _utils = new Utils();
    return _utils.UpdateCompareModelsSettings(projectSettings, baseNotebookModel, baseNotebookModelKey, toggleVisualDisplay, absoluteVisualDisplay, baselineVisualDisplay)
      .then(response => {
        return response;
      })
      .catch((error: Error) => {
        return false;
      });
  }
  /**
   * 
  */
  const onChoicesChange = React.useCallback((ev: React.SyntheticEvent<HTMLElement>, option: IChoiceGroupOption) => {
    if (option.key === "_absolute") {
      toggleVisualDisplay = projectSettings['toggleVisualDisplay'];
      compareModelsVisual(toggleVisualDisplay, true, false);
      setSelectedKeyChoice('_absolute');
      projectSettings['absoluteVisualDisplay'] = true;
      projectSettings['baselineVisualDisplay'] = false;
    }
    else {
      toggleVisualDisplay = projectSettings['toggleVisualDisplay'];
      compareModelsVisual(toggleVisualDisplay, false, true);
      setSelectedKeyChoice('_comparative');
      projectSettings['absoluteVisualDisplay'] = false;
      projectSettings['baselineVisualDisplay'] = true;
    }
  }, []);
  /**
   * Toggle between comparative and absolute value views.
   * @param ev 
   * @param checked 
  */
  const onToggleChange = (ev: React.MouseEvent<HTMLElement>, checked?: boolean): void => {
    if (checked) {
      projectSettings['toggleVisualDisplay'] = true;
      setToggleVisualDisplay(true);
      compareModelsVisual(true, absoluteVisualDisplay, baselineVisualDisplay);
    }
    else {
      projectSettings['toggleVisualDisplay'] = false;
      setToggleVisualDisplay(false);
      compareModelsVisual(false, absoluteVisualDisplay, baselineVisualDisplay);
    }
  }
  /**
   * Inline styles for Fluent components.
  */
  const dropdownStyles: Partial<IDropdownStyles> = {
    dropdown: { width: 270, alignContent: 'left' },
    dropdownOptionText: { overflow: 'hidden', whiteSpace: 'normal', alignContent: 'left' },
    dropdownItem: { height: 'auto', alignContent: 'left' },
  };
  const hostStyles: Partial<ITooltipHostStyles> = {
    root: { display: 'inline-block', alignContent: 'center', verticalAlign: 'center' }
  };
  const iconStyles = {
    marginRight: '8px',
    marginLeft: '4px',
    verticalAlign: 'bottom',
  };

  const stackTokensCheckbox = {
    childrenGap: 20, padding: '0px 0px 0px 0px'
  };

  const choiceGroupStyles = {
    label: {
      display: "inline"
    },
    flexContainer: {
      columnGap: "1rem",
      display: "flex",
      flexDirection: "row",
      flexWrap: "wrap"
    }
  };
  const showColorPicker = () => {
    dispatch({ type: 'COLOR_SELECTOR_MODAL_STATE', payload: true });
  };

  return (
    <>
      <div className="modelsMainDiv">
        <table className='modelsSettingsTable'>
          <tbody>
            <tr>
              <td>
                <Dropdown
                  selectedKeys={selectedModelKeys}
                  id='modelsSelection'
                  label="Notebooks"
                  placeholder="Select notebooks"
                  multiSelect
                  options={notebookOptions}
                  styles={dropdownStyles}
                  onChange={updateModels}
                />
              </td>
              <td>
                <Dropdown
                  selectedKeys={selectedMetricKeys}
                  id='metricsSelection'
                  label="Metrics"
                  placeholder="Edit metric selections"
                  multiSelect
                  options={metricHeaders}
                  styles={dropdownStyles}
                  onChange={updateMetrics}
                />
              </td>
              <td>
                <Dropdown
                  selectedKeys={selectedCohortsKeys}
                  id='cohortSettings'
                  label="Cohorts"
                  placeholder="Create or edit cohorts"
                  multiSelect
                  options={cohortOptions}
                  onRenderOption={onRenderCohortOptions}
                  styles={dropdownStyles}
                  onChange={updateCohorts}
                />
              </td>
              <td>
                <TooltipHost content='Cohorts settings' id='tooltipCohortsSettings' styles={hostStyles}>
                  <a tabIndex={0} onKeyPress={openCohortPanel} onClick={openCohortPanel} className="cohortsSettingsLink" >
                    <FontIcon aria-label="Cohorts Settings" iconName="Settings" className="cohortsSettingsIcon" />
                  </a>
                </TooltipHost>
              </td>
            </tr>
            <tr><td colSpan={4}>&nbsp;</td></tr>
            <tr>
              <td colSpan={3}>
                <Stack horizontal tokens={stackTokensCheckbox}>
                  <Stack.Item align="baseline" >
                    <Toggle
                      label={<div className="modelsSettingOptions">Visual display</div>}
                      checked={_toggleVisualDisplay}
                      inlineLabel
                      onChange={onToggleChange}
                      role="checkbox"
                    />
                  </Stack.Item>
                  <Stack.Item align="baseline">
                    <ChoiceGroup styles={choiceGroupStyles} title="Select between absolute and comparative view" selectedKey={selectedKeyChoice} options={choiceOptions} onChange={onChoicesChange} />
                  </Stack.Item>
                </Stack>
              </td>
              <td>&nbsp;</td>
            </tr>
          </tbody>
        </table>
        <div key='absoluteView' hidden={absoluteHidden} tabIndex={0}>
          <Absolute
            children={modelsStatsList}
          />
        </div>
        <div key='comparativeView' hidden={comparativeHidden} tabIndex={0}>
          <Comparative
            children={modelsStatsList}
          />
        </div>
      </div>
      <CohortSettings />
      <ColorSelector />
    </>
  );
}
