// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { useState, useMemo } from 'react';
export const WorkModeData = (dataItems, config = null) => {
    const [sortConfig, setSortConfig] = useState(config);
    const sortedItems = useMemo(() => {
        let sortableItems = [...dataItems];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                if (sortConfig.key === 'accuracy') {
                    if (a[sortConfig.key] < b[sortConfig.key]) {
                        return sortConfig.direction === 'ascending' ? -1 : 1;
                    }
                    if (a[sortConfig.key] > b[sortConfig.key]) {
                        return sortConfig.direction === 'ascending' ? 1 : -1;
                    }
                }
                else {
                    if (a[sortConfig.key].props.children.props.id < b[sortConfig.key].props.children.props.id) {
                        return sortConfig.direction === 'ascending' ? -1 : 1;
                    }
                    if (a[sortConfig.key].props.children.props.id > b[sortConfig.key].props.children.props.id) {
                        return sortConfig.direction === 'ascending' ? 1 : -1;
                    }
                }
                return 0;
            });
        }
        return sortableItems;
    }, [dataItems, sortConfig]);
    const sortItems = (key: any) => {
        let direction = 'ascending';
        if (
            sortConfig &&
            sortConfig.key === key &&
            sortConfig.direction === 'ascending'
        ) {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };
    return { items: sortedItems, sortItems, sortConfig };
};