import { type FC, useState } from 'react';
import { useSelector } from 'react-redux';

import { c } from 'ttag';

import { Href } from '@proton/atoms';
import { Icon } from '@proton/components/index';
import { ExtraFieldsControl } from '@proton/pass/components/Form/Field/Control/ExtraFieldsControl';
import { OTPValueControl } from '@proton/pass/components/Form/Field/Control/OTPValueControl';
import { ValueControl } from '@proton/pass/components/Form/Field/Control/ValueControl';
import { FieldsetCluster } from '@proton/pass/components/Form/Field/Layout/FieldsetCluster';
import { TextAreaReadonly } from '@proton/pass/components/Form/legacy/TextAreaReadonly';
import { UpgradeButton } from '@proton/pass/components/Layout/Button/UpgradeButton';
import { PasswordStrength } from '@proton/pass/components/Password/PasswordStrength';
import type { ItemContentProps } from '@proton/pass/components/Views/types';
import { UpsellRef } from '@proton/pass/constants';
import { usePasswordStrength } from '@proton/pass/hooks/monitor/usePasswordStrength';
import { useDeobfuscatedItem } from '@proton/pass/hooks/useDeobfuscatedItem';
import { useDisplayEmailUsernameFields } from '@proton/pass/hooks/useDisplayEmailUsernameFields';
import { useFeatureFlag } from '@proton/pass/hooks/useFeatureFlag';
import { getCharsGroupedByColor } from '@proton/pass/hooks/usePasswordGenerator';
import type { SanitizedPasskey } from '@proton/pass/lib/passkeys/types';
import { selectAliasByAliasEmail, selectTOTPLimits } from '@proton/pass/store/selectors';
import type { MaybeNull } from '@proton/pass/types';
import { PassFeature } from '@proton/pass/types/api/features';

import { PasskeyContentModal } from '../Passkey/Passkey.modal';

export const LoginContent: FC<ItemContentProps<'login'>> = ({ revision }) => {
    const { data: item, shareId, itemId } = revision;
    const [passkey, setPasskey] = useState<MaybeNull<SanitizedPasskey>>(null);
    const usernameSplitEnabled = useFeatureFlag(PassFeature.PassUsernameSplit);

    const {
        metadata: { note },
        content: { itemEmail, itemUsername, password, urls, totpUri, passkeys },
        extraFields,
    } = useDeobfuscatedItem(item);

    const relatedAlias = useSelector(selectAliasByAliasEmail(itemEmail));
    const totpAllowed = useSelector(selectTOTPLimits).totpAllowed(itemId);
    const passwordStrength = usePasswordStrength(password);
    const { emailDisplay, usernameDisplay } = useDisplayEmailUsernameFields({ itemEmail, itemUsername });
    const iconWithFeatureFlag = usernameSplitEnabled ? 'envelope' : 'user';
    const labelWithFeatureFlag = usernameSplitEnabled ? c('Label').t`Email` : c('Label').t`Username`;

    return (
        <>
            {(passkeys ?? []).map((passkey) => (
                <FieldsetCluster mode="read" key={passkey.keyId} className="pass-fieldset-cluster--standout">
                    <ValueControl
                        icon={'pass-passkey'}
                        label={`${c('Label').t`Passkey`} • ${passkey.domain}`}
                        value={passkey.userName}
                        onClick={() => setPasskey(passkey)}
                        actions={[<Icon className="mt-3" name="chevron-right" size={3} />]}
                    />
                </FieldsetCluster>
            ))}

            {passkey && <PasskeyContentModal passkey={passkey} onClose={() => setPasskey(null)} open size="small" />}

            <FieldsetCluster mode="read" as="div">
                {(emailDisplay || !usernameDisplay) && (
                    <ValueControl
                        clickToCopy
                        icon={relatedAlias ? 'alias' : iconWithFeatureFlag}
                        label={relatedAlias ? c('Label').t`Email (alias)` : labelWithFeatureFlag}
                        value={emailDisplay}
                    />
                )}

                {usernameDisplay && (
                    <ValueControl clickToCopy icon="user" label={c('Label').t`Username`} value={usernameDisplay} />
                )}

                <ValueControl
                    clickToCopy
                    hidden
                    icon="key"
                    label={c('Label').t`Password`}
                    value={password}
                    ellipsis={false}
                    valueClassName="text-monospace text-break-all"
                    actions={
                        passwordStrength
                            ? [<PasswordStrength className="mr-4" strength={passwordStrength} inline />]
                            : undefined
                    }
                    actionsContainerClassName="flex flex-row-reverse"
                >
                    {password.length ? getCharsGroupedByColor(password) : undefined}
                </ValueControl>

                {totpUri && totpAllowed && <OTPValueControl payload={{ totpUri, type: 'uri' }} />}

                {totpUri && !totpAllowed && (
                    <ValueControl icon="lock" label={c('Label').t`2FA secret key (TOTP)`}>
                        <UpgradeButton inline upsellRef={UpsellRef.LIMIT_2FA} />
                    </ValueControl>
                )}
            </FieldsetCluster>

            {urls.length > 0 && (
                <FieldsetCluster mode="read" as="div">
                    <ValueControl icon="earth" label={c('Label').t`Websites`}>
                        {urls.map((url) => (
                            <Href className="block text-ellipsis" href={url} key={url}>
                                {url}
                            </Href>
                        ))}
                    </ValueControl>
                </FieldsetCluster>
            )}

            {note && (
                <FieldsetCluster mode="read" as="div">
                    <ValueControl
                        clickToCopy
                        as={TextAreaReadonly}
                        icon="note"
                        label={c('Label').t`Note`}
                        value={note}
                    />
                </FieldsetCluster>
            )}

            {Boolean(extraFields.length) && (
                <ExtraFieldsControl extraFields={extraFields} itemId={itemId} shareId={shareId} />
            )}
        </>
    );
};
