import React, { useRef } from 'react';
import { c } from 'ttag';
import {
    Icon,
    DropdownMenu,
    DropdownMenuButton,
    useApi,
    useEventManager,
    useNotifications,
    useModals,
    ConfirmModal,
    Alert,
    Group,
    ButtonGroup
} from 'react-components';
import { labelMessages, markMessageAsUnread } from 'proton-shared/lib/api/messages';
import { MAILBOX_LABEL_IDS } from 'proton-shared/lib/constants';
import { noop } from 'proton-shared/lib/helpers/function';
import downloadFile from 'proton-shared/lib/helpers/downloadFile';
import { reportPhishing } from 'proton-shared/lib/api/reports';

import { MessageExtended, MessageExtendedWithData } from '../../../models/message';
import MessageHeadersModal from '../modals/MessageHeadersModal';
import { useAttachmentCache } from '../../../containers/AttachmentProvider';
import { getDate } from '../../../helpers/elements';
import { formatFileNameDate } from '../../../helpers/date';
import MessagePrintModal from '../modals/MessagePrintModal';
import { exportBlob } from '../../../helpers/message/messageExport';
import HeaderDropdown from './HeaderDropdown';
import { useMoveToFolder } from '../../../hooks/useApplyLabels';
import { getStandardFolders } from '../../../helpers/labels';

const { INBOX, TRASH, SPAM } = MAILBOX_LABEL_IDS;

interface Props {
    labelID: string;
    message: MessageExtended;
    messageLoaded: boolean;
    sourceMode: boolean;
    onBack: () => void;
    onCollapse: () => void;
    onSourceMode: (sourceMode: boolean) => void;
}

const HeaderMoreDropdown = ({
    labelID,
    message,
    messageLoaded,
    sourceMode,
    onBack,
    onCollapse,
    onSourceMode
}: Props) => {
    const api = useApi();
    const attachmentsCache = useAttachmentCache();
    const { call } = useEventManager();
    const { createNotification } = useNotifications();
    const { createModal } = useModals();
    const closeDropdown = useRef<() => void>();
    const moveToFolder = useMoveToFolder();

    const handleMove = (folderID: string, fromFolderID: string) => async () => {
        closeDropdown.current?.();
        const folderName = getStandardFolders()[folderID].name;
        moveToFolder(true, [message.data?.ID || ''], folderID, folderName, fromFolderID);
    };

    const handleUnread = async () => {
        closeDropdown.current?.();
        await api(markMessageAsUnread([message.data?.ID]));
        await call();
        onCollapse();
    };

    // Reference: Angular/src/app/bugReport/factories/bugReportModel.js
    const handleConfirmPhishing = async () => {
        await api(
            reportPhishing({
                MessageID: message.data?.ID,
                MIMEType: message.data?.MIMEType === 'text/plain' ? 'text/plain' : 'text/html', // Accept only 'text/plain' / 'text/html'
                Body: message.decryptedBody
            })
        );
        await api(labelMessages({ LabelID: SPAM, IDs: [message.data?.ID] }));
        await call();
        createNotification({ text: c('Success').t`Phishing reported` });
        onBack();
    };

    const handlePhishing = () => {
        createModal(
            <ConfirmModal title={c('Info').t`Confirm phishing report`} onConfirm={handleConfirmPhishing} onClose={noop}>
                <Alert type="warning">{c('Info')
                    .t`Reporting a message as a phishing attempt will send the message to us, so we can analyze it and improve our filters. This means that we will be able to see the contents of the message in full.`}</Alert>
            </ConfirmModal>
        );
    };

    const handleHeaders = () => {
        createModal(<MessageHeadersModal message={message.data} />);
    };

    const handleExport = async () => {
        // Angular/src/app/message/directives/actionMessage.js
        const { Subject = '' } = message.data || {};
        const time = formatFileNameDate(getDate(message.data, labelID));
        const blob = await exportBlob(message, attachmentsCache, api);
        const filename = `${Subject} ${time}.eml`;
        downloadFile(blob, filename);
    };

    const handlePrint = async () => {
        createModal(<MessagePrintModal message={message as MessageExtendedWithData} labelID={labelID} />);
    };

    const messageLabelIDs = message.data?.LabelIDs || [];
    const isSpam = messageLabelIDs.includes(SPAM);
    const isInInbox = messageLabelIDs.includes(INBOX);
    const isInTrash = messageLabelIDs.includes(TRASH);

    return (
        <Group className="mr1 mb0-5">
            <ButtonGroup disabled={!messageLoaded} icon="unread" onClick={handleUnread} />
            {isInInbox && <ButtonGroup disabled={!messageLoaded} icon="trash" onClick={handleMove(TRASH, INBOX)} />}
            {isInTrash && <ButtonGroup disabled={!messageLoaded} icon="inbox" onClick={handleMove(INBOX, TRASH)} />}

            <HeaderDropdown
                disabled={!messageLoaded}
                className="pm-button pm-button--for-icon pm-group-button"
                autoClose={true}
            >
                {({ onClose }) => {
                    closeDropdown.current = onClose;
                    return (
                        <DropdownMenu>
                            {isSpam ? (
                                <DropdownMenuButton
                                    className="alignleft flex flex-nowrap"
                                    onClick={handleMove(INBOX, SPAM)}
                                >
                                    <Icon name="nospam" className="mr0-5 mt0-25" />
                                    <span className="flex-item-fluid mtauto mbauto">{c('Action').t`Not a spam`}</span>
                                </DropdownMenuButton>
                            ) : (
                                <DropdownMenuButton
                                    className="alignleft flex flex-nowrap"
                                    onClick={handleMove(SPAM, INBOX)}
                                >
                                    <Icon name="spam" className="mr0-5 mt0-25" />
                                    <span className="flex-item-fluid mtauto mbauto">{c('Action').t`Mark as spam`}</span>
                                </DropdownMenuButton>
                            )}
                            <DropdownMenuButton className="alignleft flex flex-nowrap" onClick={handlePhishing}>
                                <Icon name="phishing" className="mr0-5 mt0-25" />
                                <span className="flex-item-fluid mtauto mbauto">{c('Action').t`Report phishing`}</span>
                            </DropdownMenuButton>
                            {!sourceMode && (
                                <DropdownMenuButton
                                    className="alignleft flex flex-nowrap"
                                    onClick={() => onSourceMode(true)}
                                >
                                    <Icon name="view-source-code" className="mr0-5 mt0-25" />
                                    <span className="flex-item-fluid mtauto mbauto">{c('Action')
                                        .t`View source code`}</span>
                                </DropdownMenuButton>
                            )}
                            {sourceMode && (
                                <DropdownMenuButton
                                    className="alignleft flex flex-nowrap"
                                    onClick={() => onSourceMode(false)}
                                >
                                    <Icon name="view-html-code" className="mr0-5 mt0-25" />
                                    <span className="flex-item-fluid mtauto mbauto">{c('Action')
                                        .t`View rendered HTML`}</span>
                                </DropdownMenuButton>
                            )}
                            <DropdownMenuButton className="alignleft flex flex-nowrap" onClick={handleHeaders}>
                                <Icon name="view-headers" className="mr0-5 mt0-25" />
                                <span className="flex-item-fluid mtauto mbauto">{c('Action').t`View headers`}</span>
                            </DropdownMenuButton>
                            <DropdownMenuButton className="alignleft flex flex-nowrap" onClick={handleExport}>
                                <Icon name="export" className="mr0-5 mt0-25" />
                                <span className="flex-item-fluid mtauto mbauto">{c('Action').t`Export`}</span>
                            </DropdownMenuButton>
                            <DropdownMenuButton className="alignleft flex flex-nowrap" onClick={handlePrint}>
                                <Icon name="print" className="mr0-5 mt0-25" />
                                <span className="flex-item-fluid mtauto mbauto">{c('Action').t`Print`}</span>
                            </DropdownMenuButton>
                        </DropdownMenu>
                    );
                }}
            </HeaderDropdown>
        </Group>
    );
};

export default HeaderMoreDropdown;
