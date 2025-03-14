import { useLayoutEffect } from 'react';

import { useUserSettings } from '@proton/account/userSettings/hooks';
import { DENSITY } from '@proton/shared/lib/constants';

const { COMPACT, COMFORTABLE } = DENSITY;

const CLASSES = {
    [COMPACT]: 'is-compact',
    [COMFORTABLE]: 'is-comfortable',
} as const;

const DensityInjector = () => {
    const [{ Density } = { Density: COMFORTABLE }] = useUserSettings();

    useLayoutEffect(() => {
        document.body.classList.add(CLASSES[Density]);
        return () => {
            document.body.classList.remove(CLASSES[Density]);
        };
    }, [Density]);

    return null;
};

export default DensityInjector;
