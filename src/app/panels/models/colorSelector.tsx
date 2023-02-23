// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import * as React from 'react';
import { useState, useMemo } from 'react';
import { Label } from '@fluentui/react/lib/Label';
import { FontIcon } from '@fluentui/react/lib/Icon';
import { useSelector, useDispatch } from 'react-redux';
import { PrimaryButton, DefaultButton } from '@fluentui/react/lib/Button';
import {
  ColorPicker,
  IChoiceGroupOption,
  getColorFromString,
  IColor,
  IColorPickerStyles,
  IDragOptions,
  ContextualMenu, 
  getTheme, 
  mergeStyleSets, 
  FontWeights,
  Modal, 
  Stack, 
  IStackTokens 
} from '@fluentui/react';
import { Utils } from '../../../core/utils';
import { IColorValuesType } from '../../../core/components'

const white = getColorFromString('#ffffff')!;

export const ColorSelector: React.FunctionComponent = () => { 
  const dispatch = useDispatch();
  const state = useSelector((state) => state);
  let projectSettings = state["projectSettings"];
  const showModal = state['colorSelectorModalState'];
  const userColorSelections = state['userColorSelections'];
  const heatmapColors = projectSettings['heatmapColors'];

  const [color, setColor] = useState(white);
  const [cics, setCics] = useState<IColor>();
  const [cdcs, setCdcs] = useState<IColor>();
  const [acs, setACS] = useState<IColor>();

  const setHeatmapColors = () => {
    setCics(heatmapColors['comparativeDeclineColor']);
    setCdcs(heatmapColors['comparativeImprovementColor']);
    setACS(heatmapColors['absoluteColor']);
  }
  useMemo(() => setHeatmapColors(), [],);

  const updateColor = React.useCallback((ev: any, colorObj: IColor) => {
    setColor(colorObj);
    dispatch({ type: 'USER_COLOR_SELECTION', payload: [colorObj.r, colorObj.g, colorObj.b] });
  }, []);
  const saveCompImprovementSelection = () => {
    setCics(color);
    dispatch({ type: 'COMPARATIVE_IMPROVEMENT_COLOR', payload: userColorSelections });
  }
  const saveCompDeclineSelection = () => {
    setCdcs(color);
    dispatch({ type: 'COMPARATIVE_DECLINE_COLOR', payload: userColorSelections });
  }
  const saveAbsoluteSelection = () => {
    setACS(color);
    dispatch({ type: 'ABSOLUTE_COLOR', payload: userColorSelections });
  }
  const handleClose = () => {
    dispatch({ type: 'COLOR_SELECTOR_MODAL_STATE', payload: false });
  }
  /**
   * Update settings  
  */
  const updateColorSelectionSettings = async () => {
    let userColorSelections = {} as IColorValuesType;
    userColorSelections.comparativeDeclineColor = `${cdcs?.r},${cdcs?.g},${cdcs?.b}`;
    userColorSelections.comparativeImprovementColor = `${cics?.r},${cics?.g},${cics?.b}`;
    userColorSelections.absoluteColor = `${acs?.r},${acs?.g},${acs?.b}`;
    projectSettings.resetColorsDefault = false;
    projectSettings.heatmapColors = userColorSelections; 
    const _utils = new Utils();

    _utils.UpdateBaseProjectSettings(projectSettings).then(response => {
      if (response) {
        dispatch({ type: 'COLOR_SELECTOR_MODAL_STATE', payload: false });
      } else {
        console.log("color selection save failure.")
      }
      return response;
    }).catch((error: Error) => {
      console.log("color selection save failure: " + error.message)
    });
  }
  const restoreDefaultColors = async () => {
     const _utils = new Utils();
    projectSettings.resetColorsDefault = true;
    _utils.UpdateBaseProjectSettings(projectSettings).then(response => {
      if (response) {
        dispatch({ type: 'COLOR_SELECTOR_MODAL_STATE', payload: false });
      } else {
        console.log("color selection save failure.")
      }
      return response;
    }).catch((error: Error) => {
      console.log("color selection save failure: " + error.message)
    });
  }

  const titleId = "ColorSelectorId";
  const dragOptions: IDragOptions = {
    moveMenuItemText: 'Move',
    closeMenuItemText: 'Close',
    menu: ContextualMenu,
    dragHandleSelector: '.ms-Modal-scrollableContent> div:first-child',
  };

  const header = 'Select your colors';
  const headerContent = 'Select one color for the absolute view and two colors for the comparative view';
  const stackTokensOne: IStackTokens = { childrenGap: 10 };
  const stackTokensTwo: IStackTokens = { childrenGap: 5 };

  return (
    <>
      <Modal
        titleAriaId={titleId}
        isOpen={showModal}
        onDismiss={handleClose}
        containerClassName={contentStyles.container}
        dragOptions={false ? dragOptions : undefined}
      >
        <div>
          <Label className={contentStyles.header}>{header}</Label>
          <Label className={contentStyles.subHeader}>{headerContent}</Label>
          <Stack horizontal={true} tokens={stackTokensOne}>
            <ColorPicker
              color={color}
              onChange={updateColor}
              alphaType='none'
              showPreview={true}
              styles={colorPickerStyles}
              strings={{
                hueAriaLabel: 'Hue',
              }}
            />
            <Stack horizontal={false} tokens={stackTokensOne}>
              <Stack horizontal={false} tokens={stackTokensTwo}>
                <Label className={contentStyles.subHeaderOne}>Absolute View</Label>
                <Label className={contentStyles.subHeaderTwo}>Performance</Label>
                <Stack horizontal={true} tokens={stackTokensTwo}>
                  <DefaultButton className={contentStyles.buttonStandard} id="btnAbsoluteSelection" onClick={saveAbsoluteSelection} text="Set color" title='Set absolute performance color' />
                  <Label className={contentStyles.body}>{acs?.str}</Label>
                </Stack>
              </Stack>
              <Stack horizontal={false} tokens={stackTokensTwo}>
                <Label className={contentStyles.subHeaderOne}>Comparative View</Label>
                <Label className={contentStyles.subHeaderTwo}>Performance&nbsp;&nbsp;<FontIcon className={contentStyles.iconClass} iconName="DoubleChevronUp12" /></Label>
                <Stack horizontal={true} tokens={stackTokensTwo}>
                  <DefaultButton className={contentStyles.buttonStandard} id="btnCompImprovementSelection" onClick={saveCompImprovementSelection} text="Set color" title='Set comparative performance improvement color' />
                  <Label className={contentStyles.body}>{cics?.str}</Label>
                </Stack>
              </Stack>
              <Stack horizontal={false} tokens={stackTokensTwo}>
                <Label className={contentStyles.subHeaderTwo}>Performance&nbsp;&nbsp;<FontIcon iconName="DoubleChevronDown12" className={contentStyles.iconClass} /></Label>
                <Stack horizontal={true} tokens={stackTokensTwo}>
                  <DefaultButton className={contentStyles.buttonStandard} id="btnCompDeclineSelection" onClick={saveCompDeclineSelection} text="Set color" title='Set comparative performance decline color' />
                  <Label className={contentStyles.body}>{cdcs?.str}</Label>
                </Stack>
              </Stack>
            </Stack>
          </Stack>
          <div className={contentStyles.footer}>
            <Stack horizontal tokens={stackTokensOne} horizontalAlign="end" verticalAlign="end">
              <PrimaryButton secondaryText="Reset default colors" onClick={restoreDefaultColors} text="Reset default" />
              <PrimaryButton secondaryText="Confirm color selection" onClick={updateColorSelectionSettings} text="Confirm" />
              <DefaultButton onClick={handleClose} text="Cancel" />
            </Stack>
          </div>
        </div>
      </Modal>
    </>
  );
};

const alphaOptions: IChoiceGroupOption[] = [
  { key: 'alpha', text: 'Alpha' },
  { key: 'transparency', text: 'Transparency' },
  { key: 'none', text: 'None' },
];

const colorPickerStyles: Partial<IColorPickerStyles> = {
  panel: { padding: 10 },
  root: {
    maxWidth: 350,
    minWidth: 300,
  },
  colorRectangle: { height: 268 },
};

const theme = getTheme();
const contentStyles = mergeStyleSets({
  container: {
    display: 'flex',
    flexFlow: 'column nowrap',
    alignItems: 'stretch',
    width: "550px",
    height: "540px"
  },
  header: [
    theme.fonts.xxLarge,
    {
      flex: '1 1 auto',
      borderTop: `4px solid ${theme.palette.themePrimary}`,
      color: theme.palette.neutralPrimary,
      display: 'flex',
      alignItems: 'center',
      fontWeight: FontWeights.semibold,
      fontSize: '18px',
      padding: '20px 10px 10px 10px',
    },
  ],
  subHeader: [
    theme.fonts.xxLarge,
    {
      alignItems: 'left',
      fontWeight: FontWeights.regular,
      fontSize: '14px',
      padding: '0px 0px 0px 10px',
    },
  ],
  subHeaderOne: [
    theme.fonts.xxLarge,
    {
      width: "180px",
      alignItems: 'left',
      textAlign: 'left',
      fontWeight: FontWeights.semibold,
      fontSize: '16px',
      margin: '15px 0px 0px 0px',
    },
  ],
  subHeaderTwo: [
    theme.fonts.xxLarge,
    {
      alignItems: 'left',
      fontWeight: FontWeights.semibold,
      fontSize: '14px',
      padding: '0px 0px 0px 0px',
    },
  ],
  body: {
    padding: '0px 0px 0px 0px',
    overflowY: 'hidden',
    fontWeight: FontWeights.regular,
    fontSize: '14px',
  },
  iconClass: {
    alignItems: 'right',
  },
  buttonStandard: {
    width: '110px'
  },
  footer: [
    theme.fonts.xLarge,
    {
      padding: '10px 10px 10px 0px',
    },
  ],
  wrapper: { display: 'flex' },
  confirmOptions: {
    marginLeft: 10,
    marginTop: 100,
  },
});