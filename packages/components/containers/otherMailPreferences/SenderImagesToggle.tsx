import { c } from 'ttag';

import Toggle from '@proton/components/components/toggle/Toggle';
import useApi from '@proton/components/hooks/useApi';
import useEventManager from '@proton/components/hooks/useEventManager';
import useNotifications from '@proton/components/hooks/useNotifications';
import useToggle from '@proton/components/hooks/useToggle';
import { useLoading } from '@proton/hooks';
import { useMailSettings } from '@proton/mail/mailSettings/hooks';
import { updateHideSenderImages } from '@proton/shared/lib/api/mailSettings';

interface Props {
    id?: string;
    className?: string;
}

const SenderImagesToggle = ({ id, className }: Props) => {
    const [mailSettings] = useMailSettings();
    const { state, toggle } = useToggle(!mailSettings?.HideSenderImages);
    const { call } = useEventManager();
    const { createNotification } = useNotifications();
    const api = useApi();
    const [loading, withLoading] = useLoading();

    const handleChange = async (checked: boolean) => {
        await api(updateHideSenderImages(+!checked));
        await call();
        toggle();
        createNotification({ text: c('Success').t`Preference saved` });
    };

    return (
        <Toggle
            id={id}
            className={className}
            checked={state}
            onChange={({ target }) => withLoading(handleChange(target.checked))}
            loading={loading}
        />
    );
};

export default SenderImagesToggle;
