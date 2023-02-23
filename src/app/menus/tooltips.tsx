// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React from 'react';
import { useId } from '@fluentui/react-hooks';
import { FontIcon } from '@fluentui/react/lib/Icon';
import { ITooltipProps, Link } from '@fluentui/react';
import { TooltipHost, ITooltipHostStyles } from '@fluentui/react/lib/Tooltip';

const hostStyles: Partial<ITooltipHostStyles> = { root: { display: 'inline-block', marginRight: '0.2rem' } };

const LargeDatasetInfoProps: ITooltipProps = {
    onRenderContent: () => (
        <div className='datasetTooltip'>
            If the size of your dataset is larger than 15GB, please  use a different utility to copy it to the artifacts directory under your root workspace folder.
            <ul>
                <li>Windows: <Link href="https://docs.microsoft.com/en-us/windows-server/administration/windows-commands/robocopy" target="_blank" underline>robocopy</Link></li>
                <li>Linux: <Link href="https://www.linux.org/docs/man1/cp.html" target="_blank" underline>CP</Link></li>
            </ul>
        </div>
    ),
};
export const LargeDatasetInfoTooltip: React.FunctionComponent = () => {
    const LargeDatasetTipId = useId('tooltip');
    return (
        <div>&nbsp;&nbsp;
            <TooltipHost
                closeDelay={1000}
                id={LargeDatasetTipId}
                tooltipProps={LargeDatasetInfoProps}
                styles={hostStyles}
            >
                <FontIcon aria-label={LargeDatasetTipId} iconName="Info" />
            </TooltipHost>
        </div>
    );
};
const RegisterModelInfoProps: ITooltipProps = {
    onRenderContent: () => (
        <div className='registerModelTooltip'>
            Registering a model to a notebook assigns the model as the notebook's representative model comparison.
        </div>
    ),
};
export const RegisterModelInfoTooltip: React.FunctionComponent = () => {
    const RegisterModelTipId = useId('tooltip');
    return (
        <div className='registerModelInfoStyles'>
            <TooltipHost
                closeDelay={1000}
                id={RegisterModelTipId}
                tooltipProps={RegisterModelInfoProps}
                styles={hostStyles}
            >
                <FontIcon aria-label={RegisterModelTipId} iconName="Info" />
            </TooltipHost>
        </div>
    );
};