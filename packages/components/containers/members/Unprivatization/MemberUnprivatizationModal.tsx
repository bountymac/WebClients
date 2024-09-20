import { c } from 'ttag';

import { memberAcceptUnprivatization, memberRejectUnprivatization } from '@proton/account/member/actions';
import { Button, InlineLinkButton } from '@proton/atoms';
import type { ModalProps } from '@proton/components/components/modalTwo/Modal';
import ModalTwo from '@proton/components/components/modalTwo/Modal';
import ModalTwoContent from '@proton/components/components/modalTwo/ModalContent';
import ModalTwoFooter from '@proton/components/components/modalTwo/ModalFooter';
import ModalTwoHeader from '@proton/components/components/modalTwo/ModalHeader';
import useModalState from '@proton/components/components/modalTwo/useModalState';
import getBoldFormattedText from '@proton/components/helpers/getBoldFormattedText';
import useApi from '@proton/components/hooks/useApi';
import useNotifications from '@proton/components/hooks/useNotifications';
import useLoading from '@proton/hooks/useLoading';
import { useDispatch } from '@proton/redux-shared-store';
import { unlockPasswordChanges } from '@proton/shared/lib/api/user';
import type { Member } from '@proton/shared/lib/interfaces';
import { type ParsedUnprivatizationData } from '@proton/shared/lib/keys';

import AuthModal from '../../password/AuthModal';

interface Props extends Omit<ModalProps<'div'>, 'children' | 'buttons'> {
    onChange: () => void;
    member: Member;
    orgName: string;
    parsedUnprivatizationData: ParsedUnprivatizationData;
}

const MemberUnprivatizationModal = ({ member, orgName, parsedUnprivatizationData, onChange, ...rest }: Props) => {
    const [loading, withLoading] = useLoading();
    const dispatch = useDispatch();
    const api = useApi();
    const [authModalProps, setAuthModal, renderAuthModal] = useModalState();
    const { createNotification } = useNotifications();

    const adminEmail = parsedUnprivatizationData.payload.unprivatizationData.AdminEmail;

    const handleAccept = () => {
        withLoading(
            dispatch(
                memberAcceptUnprivatization({
                    api,
                    member,
                    parsedUnprivatizationData,
                })
            )
        ).then(() => {
            onChange();
            createNotification({ text: c('unprivatization').t`Administrator access enabled` });
            rest.onClose?.();
        });
    };

    const handleReject = () => {
        dispatch(memberRejectUnprivatization({ api, member }));
        createNotification({ text: c('unprivatization').t`Administrator access rejected` });
        onChange();
        rest.onClose?.();
    };

    const reject = (
        <InlineLinkButton
            key="reject"
            onClick={() => {
                handleReject();
            }}
        >{c('unprivatization').t`reject`}</InlineLinkButton>
    );

    return (
        <>
            {renderAuthModal && (
                <AuthModal
                    config={unlockPasswordChanges()}
                    {...authModalProps}
                    onCancel={authModalProps.onClose}
                    onSuccess={async () => {
                        handleAccept();
                    }}
                />
            )}
            <ModalTwo {...rest}>
                <ModalTwoHeader title={c('unprivatization').t`Enable admin access?`} />
                <ModalTwoContent>
                    <p className="text-break">
                        {getBoldFormattedText(
                            c('unprivatization')
                                .t`An administrator of the **${orgName}** organization (**${adminEmail}**) wants to enable administrator access for your account.`
                        )}
                    </p>
                    <p>
                        {c('unprivatization')
                            .t`If you ever lose access to your credentials, your organization’s administrators will be able to reset your password and restore access to your account.`}
                    </p>
                    <p>{c('unprivatization').jt`You can ${reject} this request if you do not wish to proceed.`}</p>
                </ModalTwoContent>
                <ModalTwoFooter>
                    <Button onClick={rest.onClose}>{c('unprivatization').t`Cancel`}</Button>
                    <Button
                        color="norm"
                        loading={loading}
                        onClick={() => {
                            setAuthModal(true);
                        }}
                    >{c('unprivatization').t`Enable administrator access`}</Button>
                </ModalTwoFooter>
            </ModalTwo>
        </>
    );
};

export default MemberUnprivatizationModal;
