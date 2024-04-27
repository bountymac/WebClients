import { createSelector } from '@reduxjs/toolkit';

import { isMonitored, itemEq } from '@proton/pass/lib/items/item.predicates';
import { intoSelectedItem } from '@proton/pass/lib/items/item.utils';
import { getDuplicatePasswords, intoAliasMonitorAddress } from '@proton/pass/lib/monitor/monitor.utils';
import type { State } from '@proton/pass/store/types';
import type { SelectedItem } from '@proton/pass/types';
import { invert } from '@proton/pass/utils/fp/predicates';

import { selectAliasItems, selectLoginItems } from './items';

export const selectMonitorState = (state: State) => state.monitor;
export const selectMonitoredLogins = createSelector(selectLoginItems, (items) => items.filter(isMonitored));
export const selectMonitoredAliases = createSelector(selectAliasItems, (items) => items.filter(isMonitored));
export const selectExcludedLogins = createSelector(selectLoginItems, (items) => items.filter(invert(isMonitored)));
export const selectDuplicatePasswords = createSelector(selectMonitoredLogins, getDuplicatePasswords);
export const selectExcludedItems = createSelector(selectExcludedLogins, (items) => items.map(intoSelectedItem));

export const selectItemReport = (item: SelectedItem) =>
    createSelector(selectDuplicatePasswords, (duplicates) => ({
        password: { duplicates: duplicates.find((group) => group.some(itemEq(item))) ?? [] },
    }));

export const selectCustomBreaches = createSelector(selectMonitorState, (monitor) => monitor?.custom);
export const selectProtonBreaches = createSelector(selectMonitorState, (monitor) => monitor?.proton);
export const selectMonitorPreview = createSelector(selectMonitorState, (monitor) => monitor?.preview);
export const selectTotalBreaches = createSelector(selectMonitorState, (monitor) => monitor?.total);
export const selectAliasBreaches = createSelector(selectMonitoredAliases, (items) =>
    items.map(intoAliasMonitorAddress)
);
