import { useCallback } from 'react';
import { c, msgid } from 'ttag';
import { useApi, useNotifications, useEventManager, useLabels } from '@proton/components';
import { labelMessages, unlabelMessages } from '@proton/shared/lib/api/messages';
import { labelConversations, unlabelConversations } from '@proton/shared/lib/api/conversations';
import { undoActions } from '@proton/shared/lib/api/mailUndoActions';
import { MAILBOX_LABEL_IDS } from '@proton/shared/lib/constants';
import { Message } from '@proton/shared/lib/interfaces/mail/Message';
import isTruthy from '@proton/shared/lib/helpers/isTruthy';

import UndoActionNotification from '../components/notifications/UndoActionNotification';
import { isMessage as testIsMessage } from '../helpers/elements';
import { getMessagesAuthorizedToMove } from '../helpers/message/messages';
import { Element } from '../models/element';
import { useOptimisticApplyLabels } from './optimistic/useOptimisticApplyLabels';
import { SUCCESS_NOTIFICATION_EXPIRATION } from '../constants';

const { ALL_MAIL, ALL_DRAFTS, ALL_SENT, DRAFTS, SENT, STARRED, SPAM, TRASH } = MAILBOX_LABEL_IDS;

const getNotificationTextStarred = (isMessage: boolean, elementsCount: number) => {
    if (isMessage) {
        if (elementsCount === 1) {
            return c('Success').t`Message marked as Starred`;
        }
        return c('Success').ngettext(
            msgid`${elementsCount} message marked as Starred.`,
            `${elementsCount} messages marked as Starred.`,
            elementsCount
        );
    }

    if (elementsCount === 1) {
        return c('Success').t`Conversation marked as Starred`;
    }
    return c('Success').ngettext(
        msgid`${elementsCount} conversation marked as Starred.`,
        `${elementsCount} conversations marked as Starred.`,
        elementsCount
    );
};

const getNotificationTextRemoved = (isMessage: boolean, elementsCount: number, labelName: string) => {
    if (isMessage) {
        if (elementsCount === 1) {
            return c('Success').t`Message removed from ${labelName}`;
        }
        return c('Success').ngettext(
            msgid`${elementsCount} message removed from ${labelName}.`,
            `${elementsCount} messages removed from ${labelName}.`,
            elementsCount
        );
    }

    if (elementsCount === 1) {
        return c('Success').t`Conversation removed from ${labelName}`;
    }
    return c('Success').ngettext(
        msgid`${elementsCount} conversation removed from ${labelName}.`,
        `${elementsCount} conversations removed from ${labelName}.`,
        elementsCount
    );
};

const getNotificationTextAdded = (isMessage: boolean, elementsCount: number, labelName: string) => {
    if (isMessage) {
        if (elementsCount === 1) {
            return c('Success').t`Message added to ${labelName}`;
        }
        return c('Success').ngettext(
            msgid`${elementsCount} message added to ${labelName}.`,
            `${elementsCount} messages added to ${labelName}.`,
            elementsCount
        );
    }

    if (elementsCount === 1) {
        return c('Success').t`Conversation added to ${labelName}`;
    }
    return c('Success').ngettext(
        msgid`${elementsCount} conversation added to ${labelName}.`,
        `${elementsCount} conversations added to ${labelName}.`,
        elementsCount
    );
};

const joinSentences = (success: string, notAuthorized: string) => [success, notAuthorized].filter(isTruthy).join(' ');

const getNotificationTextMoved = (
    isMessage: boolean,
    elementsCount: number,
    messagesNotAuthorizedToMove: number,
    folderName: string,
    folderID?: string,
    fromLabelID?: string
) => {
    const notAuthorized = messagesNotAuthorizedToMove
        ? c('Info').ngettext(
              msgid`${messagesNotAuthorizedToMove} message could not be moved.`,
              `${messagesNotAuthorizedToMove} messages could not be moved.`,
              messagesNotAuthorizedToMove
          )
        : '';
    if (folderID === SPAM) {
        if (isMessage) {
            if (elementsCount === 1) {
                return c('Success').t`Message moved to spam and sender added to Block List.`;
            }
            return joinSentences(
                c('Success').ngettext(
                    msgid`${elementsCount} message moved to spam and sender added to Block List.`,
                    `${elementsCount} messages moved to spam and senders added to Block List.`,
                    elementsCount
                ),
                notAuthorized
            );
        }
        if (elementsCount === 1) {
            return c('Success').t`Conversation moved to spam and sender added to Block List.`;
        }
        return c('Success').ngettext(
            msgid`${elementsCount} conversation moved to spam and sender added to Block List.`,
            `${elementsCount} conversations moved to spam and senders added to Block List.`,
            elementsCount
        );
    }

    if (fromLabelID === SPAM && folderID !== TRASH) {
        if (isMessage) {
            if (elementsCount === 1) {
                // translator: Strictly 1 message moved from spam, the variable is the name of the destination folder
                return c('Success').t`Message moved to ${folderName} and sender added to Allow List.`;
            }
            return joinSentences(
                c('Success').ngettext(
                    // translator: The first variable is the number of message moved, written in digits, and the second one is the name of the destination folder
                    msgid`${elementsCount} message moved to ${folderName} and sender added to Allow List.`,
                    `${elementsCount} messages moved to ${folderName} and senders added to Allow List.`,
                    elementsCount
                ),
                notAuthorized
            );
        }
        if (elementsCount === 1) {
            return c('Success').t`Conversation moved to ${folderName} and sender added to Allow List.`;
        }
        return c('Success').ngettext(
            msgid`${elementsCount} conversation moved to ${folderName} and sender added to Allow List.`,
            `${elementsCount} conversations moved to ${folderName} and senders added to Allow List.`,
            elementsCount
        );
    }

    if (isMessage) {
        if (elementsCount === 1) {
            return c('Success').t`Message moved to ${folderName}.`;
        }
        return joinSentences(
            c('Success').ngettext(
                msgid`${elementsCount} message moved to ${folderName}.`,
                `${elementsCount} messages moved to ${folderName}.`,
                elementsCount
            ),
            notAuthorized
        );
    }

    if (elementsCount === 1) {
        return c('Success').t`Conversation moved to ${folderName}.`;
    }
    return c('Success').ngettext(
        msgid`${elementsCount} conversation moved to ${folderName}.`,
        `${elementsCount} conversations moved to ${folderName}.`,
        elementsCount
    );
};

export const useApplyLabels = () => {
    const api = useApi();
    const { call, stop, start } = useEventManager();
    const { createNotification } = useNotifications();
    const [labels = []] = useLabels();
    const optimisticApplyLabels = useOptimisticApplyLabels();

    const applyLabels = useCallback(
        async (elements: Element[], changes: { [labelID: string]: boolean }, silent = false) => {
            if (!elements.length) {
                return;
            }

            const isMessage = testIsMessage(elements[0]);
            const labelAction = isMessage ? labelMessages : labelConversations;
            const unlabelAction = isMessage ? unlabelMessages : unlabelConversations;
            const changesKeys = Object.keys(changes);
            const elementIDs = elements.map((element) => element.ID);
            const rollbacks = {} as { [labelID: string]: () => void };

            const handleDo = async () => {
                let tokens = [];
                try {
                    // Stop the event manager to prevent race conditions
                    stop();
                    tokens = await Promise.all(
                        changesKeys.map(async (LabelID) => {
                            rollbacks[LabelID] = optimisticApplyLabels(elements, { [LabelID]: changes[LabelID] });
                            try {
                                const action = changes[LabelID] ? labelAction : unlabelAction;
                                const { UndoToken } = await api(action({ LabelID, IDs: elementIDs }));
                                return UndoToken.Token;
                            } catch (error: any) {
                                rollbacks[LabelID]();
                                throw error;
                            }
                        })
                    );
                } finally {
                    start();
                    await call();
                }
                return tokens;
            };

            const handleUndo = async (tokens: string[]) => {
                try {
                    const filteredTokens = tokens.filter(isTruthy);
                    // Stop the event manager to prevent race conditions
                    stop();
                    await Promise.all(filteredTokens.map((token) => api(undoActions(token))));
                } finally {
                    start();
                    await call();
                }
            };

            // No await ==> optimistic
            const promise = handleDo();

            let notificationText = c('Success').t`Labels applied.`;

            const elementsCount = elementIDs.length;

            if (changesKeys.length === 1) {
                const labelName = labels.filter((l) => l.ID === changesKeys[0])[0]?.Name;

                if (changesKeys[0] === MAILBOX_LABEL_IDS.STARRED) {
                    notificationText = getNotificationTextStarred(isMessage, elementsCount);
                } else if (!Object.values(changes)[0]) {
                    notificationText = getNotificationTextRemoved(isMessage, elementsCount, labelName);
                } else {
                    notificationText = getNotificationTextAdded(isMessage, elementsCount, labelName);
                }
            }

            if (!silent) {
                createNotification({
                    text: (
                        <UndoActionNotification
                            onUndo={async () => {
                                const tokens = await promise;
                                handleUndo(tokens);
                            }}
                            promise={promise}
                        >
                            {notificationText}
                        </UndoActionNotification>
                    ),
                    expiration: SUCCESS_NOTIFICATION_EXPIRATION,
                });
            }
        },
        [labels]
    );

    return applyLabels;
};

export const useMoveToFolder = () => {
    const api = useApi();
    const { call, stop, start } = useEventManager();
    const { createNotification } = useNotifications();
    const [labels = []] = useLabels();
    const labelIDs = labels.map(({ ID }) => ID);
    const optimisticApplyLabels = useOptimisticApplyLabels();

    const moveToFolder = useCallback(
        async (elements: Element[], folderID: string, folderName: string, fromLabelID: string, silent = false) => {
            if (!elements.length) {
                return;
            }

            const isMessage = testIsMessage(elements[0]);
            const action = isMessage ? labelMessages : labelConversations;
            const canUndo = isMessage
                ? !([ALL_MAIL, ALL_DRAFTS, ALL_SENT] as string[]).includes(fromLabelID)
                : ![...labelIDs, ALL_DRAFTS, DRAFTS, ALL_SENT, SENT, STARRED, ALL_MAIL].includes(fromLabelID);
            const authorizedToMove = isMessage
                ? getMessagesAuthorizedToMove(elements as Message[], folderID)
                : elements;
            const elementIDs = authorizedToMove.map((element) => element.ID);

            if (!authorizedToMove.length) {
                createNotification({
                    text: c('Error display when performing invalid move on message').t`This action cannot be performed`,
                    type: 'error',
                });
                return;
            }

            const rollback = optimisticApplyLabels(authorizedToMove, { [folderID]: true }, true, fromLabelID);

            const handleDo = async () => {
                let token;
                try {
                    // Stop the event manager to prevent race conditions
                    stop();
                    const { UndoToken } = await api(action({ LabelID: folderID, IDs: elementIDs }));
                    // We are not checking ValidUntil since notification stay for few seconds after this action
                    token = UndoToken.Token;
                } catch (error: any) {
                    rollback();
                } finally {
                    start();
                    await call();
                }
                return token;
            };

            // No await ==> optimistic
            const promise = handleDo();

            if (!silent) {
                const notificationText = getNotificationTextMoved(
                    isMessage,
                    authorizedToMove.length,
                    elements.length - authorizedToMove.length,
                    folderName,
                    folderID,
                    fromLabelID
                );

                const handleUndo = async (token: string) => {
                    try {
                        // Stop the event manager to prevent race conditions
                        stop();
                        rollback();
                        await api(undoActions(token));
                    } finally {
                        start();
                        await call();
                    }
                };

                createNotification({
                    text: (
                        <UndoActionNotification
                            onUndo={
                                canUndo
                                    ? async () => {
                                          const token = await promise;
                                          handleUndo(token);
                                      }
                                    : undefined
                            }
                            promise={promise}
                        >
                            {notificationText}
                        </UndoActionNotification>
                    ),
                    expiration: SUCCESS_NOTIFICATION_EXPIRATION,
                });
            }
        },
        [labels]
    );

    return moveToFolder;
};

export const useStar = () => {
    const api = useApi();
    const { call, stop, start } = useEventManager();
    const optimisticApplyLabels = useOptimisticApplyLabels();

    const star = useCallback(async (elements: Element[], value: boolean) => {
        if (!elements.length) {
            return;
        }

        const isMessage = testIsMessage(elements[0]);
        const labelAction = isMessage ? labelMessages : labelConversations;
        const unlabelAction = isMessage ? unlabelMessages : unlabelConversations;
        const action = value ? labelAction : unlabelAction;

        const rollback = optimisticApplyLabels(elements, { [MAILBOX_LABEL_IDS.STARRED]: value });

        try {
            // Stop the event manager to prevent race conditions
            stop();
            await api(action({ LabelID: MAILBOX_LABEL_IDS.STARRED, IDs: elements.map((element) => element.ID) }));
        } catch (error: any) {
            rollback();
            throw error;
        } finally {
            start();
            await call();
        }
    }, []);

    return star;
};
