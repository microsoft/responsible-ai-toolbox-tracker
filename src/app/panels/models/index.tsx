// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable curly */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/quotes */
import { Store } from "redux";
import * as React from "react";
import { Provider } from 'react-redux';
import { Stack } from '@fluentui/react/lib/Stack';
import { ReactWidget } from '@jupyterlab/apputils';
import { ScrollbarVisibility } from '@fluentui/react';
import { ScrollablePane } from '@fluentui/react/lib/ScrollablePane';
import '../../../../style/models.css';
import { ModelsData } from './modelsData';
import { Utils } from '../../../core/utils';

export class CompareModels extends ReactWidget {
    private store: Store;
    constructor(store: Store) {
        super();
        this.store = store;
        this.addClass('raiMainPanel');
        this.id = 'compare-models';
        this.title.label = 'Compare Models';
        this.title.closable = true;
        this.node.tabIndex = 0;
    }
    dispose() {
        let projectSettings = this.store.getState().projectSettings;
        projectSettings['showCompareModels'] = false;
        /**
         * instantiate the util object.
        */
        const _utils = new Utils();
        _utils.UpdateBaseProjectSettings(projectSettings);
        super.dispose();
    }
    protected render() {
        return (
            <Provider store={this.store}>
                <Stack grow>
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
                        <div className="ScrollablePaneWrapper">
                            <ScrollablePane scrollbarVisibility={ScrollbarVisibility.auto}>
                                <div><ModelsData /></div>
                            </ScrollablePane>
                        </div>
                    </Stack.Item>
                </Stack >
            </Provider>
        );
    }
}