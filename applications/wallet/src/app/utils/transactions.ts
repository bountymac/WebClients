import { format, isSameWeek, isToday } from 'date-fns';
import { compact } from 'lodash';
import { c } from 'ttag';

import { WasmTransactionDetails, WasmTxOut } from '@proton/andromeda';
import { SECOND } from '@proton/shared/lib/constants';
import { dateLocale } from '@proton/shared/lib/i18n';
import { Address } from '@proton/shared/lib/interfaces';
import { WalletMap } from '@proton/wallet';

import { TransactionData } from '../hooks/useWalletTransactions';
import { isSelfAddress } from './email';
import { formatReadableNameAndEmail, multilineStrToOnelineJsx } from './string';

const toMsTimestamp = (ts: number | BigInt) => {
    return Number(ts) * SECOND;
};

export const transactionTime = (transaction: WasmTransactionDetails) => {
    if (transaction.time?.confirmation_time) {
        return toMsTimestamp(transaction.time?.confirmation_time);
    }

    if (transaction.time?.last_seen) {
        return toMsTimestamp(transaction.time?.last_seen);
    }

    return new Date().getTime();
};

export const getFormattedPeriodSinceConfirmation = (now: Date, confirmation: Date) => {
    const options = { locale: dateLocale };
    if (!confirmation) {
        return;
    }

    if (isToday(confirmation)) {
        return format(confirmation, 'p', options);
    }

    if (isSameWeek(confirmation, now, options)) {
        return format(confirmation, 'EEEE, p', options);
    }

    return format(confirmation, 'MMM d, y, p', options);
};

const getWalletAndAccountFromTransaction = (transaction: TransactionData, walletMap: WalletMap) => {
    const { apiData } = transaction;

    if (!apiData) {
        return { wallet: undefined, account: undefined };
    }

    const wallet = walletMap[apiData.WalletID];
    const account = apiData.WalletAccountID ? wallet?.accounts[apiData.WalletAccountID] : undefined;

    return { wallet, account };
};

export const getTransactionSenderHumanReadableName = (transaction: TransactionData, walletMap: WalletMap) => {
    const isSentTx = transaction.networkData.sent > transaction.networkData.received;
    const { wallet, account } = getWalletAndAccountFromTransaction(transaction, walletMap);

    // If transaction was sent using the current wallet account, we display the Wallet - WalletAccount as sender
    if (isSentTx && wallet && account) {
        return `${wallet.wallet.Wallet.Name} - ${account.Label}`;
    }
    // If there is a sender attached to the transaction, we display it
    const sender = transaction.apiData?.Sender;
    if (sender) {
        if (typeof sender === 'string') {
            return sender;
        } else {
            if (sender.name && sender.email) {
                return formatReadableNameAndEmail(sender.name, sender.email);
            }
            return sender.email;
        }
    }

    // Fallback
    return c('Wallet transaction').t`Unknown`;
};

export const getTransactionRecipientHumanReadableName = (
    transaction: TransactionData,
    output: WasmTxOut,
    walletMap: WalletMap,
    addresses: Address[] = []
) => {
    const address = transaction.apiData?.ToList[output.address];
    const isSentTx = transaction.networkData.sent > transaction.networkData.received;
    const { wallet, account } = getWalletAndAccountFromTransaction(transaction, walletMap);

    // If output is owned by wallet account and transaction wasn't sent from it, we display the Wallet - WalletAccount as recipient
    if (!isSentTx && output.is_mine && wallet && account) {
        return `${wallet.wallet.Wallet.Name} - ${account.Label}`;
    }

    if (address) {
        return isSelfAddress(address, addresses ?? []) ? c('Wallet transaction').t`${address} (me)` : address;
    }

    return output.address;
};

export const getTransactionRecipientsHumanReadableName = (
    transaction: TransactionData,
    walletMap: WalletMap,
    addresses: Address[] = []
) => {
    const humanReadableOutputs = compact(
        transaction.networkData.outputs
            .filter((o) => !o.is_mine)
            .map((o) => getTransactionRecipientHumanReadableName(transaction, o, walletMap, addresses))
    );

    return humanReadableOutputs;
};

export const getTransactionMessage = (transaction: TransactionData) => {
    // If transaction was sent using the current wallet account, we display the Wallet - WalletAccount as sender
    if (transaction.apiData?.Body) {
        return multilineStrToOnelineJsx(transaction.apiData?.Body ?? '', 'transaction-message');
    }

    return null;
};
