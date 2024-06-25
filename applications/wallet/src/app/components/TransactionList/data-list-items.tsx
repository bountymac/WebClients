import { useMemo } from 'react';

import { c, msgid } from 'ttag';

import { WasmApiExchangeRate } from '@proton/andromeda';
import { CircleLoader } from '@proton/atoms/CircleLoader';
import { useAddresses } from '@proton/components/hooks';
import { SECOND } from '@proton/shared/lib/constants';
import arrowReceiveSvg from '@proton/styles/assets/img/illustrations/arrow-receive.svg';
import arrowSendSvg from '@proton/styles/assets/img/illustrations/arrow-send.svg';
import clsx from '@proton/utils/clsx';

import { CoreButton } from '../../atoms';
import { Price } from '../../atoms/Price';
import { COMPUTE_BITCOIN_UNIT } from '../../constants';
import { useBitcoinBlockchainContext } from '../../contexts';
import { useResponsiveContainerContext } from '../../contexts/ResponsiveContainerContext';
import { TransactionData } from '../../hooks/useWalletTransactions';
import { useUserWalletSettings } from '../../store/hooks/useUserWalletSettings';
import {
    convertAmount,
    getFormattedPeriodSinceConfirmation,
    getLabelByUnit,
    getTransactionRecipientsHumanReadableName,
    getTransactionSenderHumanReadableName,
} from '../../utils';
import { DataListItem } from '../DataList';

export interface TxDataListItemProps {
    tx: TransactionData;
    loading?: boolean;
}

export interface TxDataWithExchangeRateListItemProps extends TxDataListItemProps {
    exchangeRate?: WasmApiExchangeRate;
}

export const ConfirmationTimeDataListItem = ({ tx, loading }: TxDataListItemProps) => {
    const { isNarrow } = useResponsiveContainerContext();
    const now = useMemo(() => new Date(), []);
    const value = tx.networkData.received - tx.networkData.sent;

    const confirmedDate =
        tx.networkData.time.confirmation_time &&
        getFormattedPeriodSinceConfirmation(now, new Date(tx.networkData.time.confirmation_time * SECOND));

    return (
        <DataListItem
            label={value >= 0 ? 'Received' : 'Sent'}
            leftIcon={
                value >= 0 ? (
                    <img
                        src={arrowReceiveSvg}
                        alt="A green arrow going down"
                        className={clsx(isNarrow ? 'mr-2' : 'mr-4')}
                    />
                ) : (
                    <img src={arrowSendSvg} alt="A red arrow going down" className={clsx(isNarrow ? 'mr-2' : 'mr-4')} />
                )
            }
            bottomNode={
                <div className={clsx(loading && 'skeleton-loader')}>
                    {confirmedDate ? (
                        <span className="color-hint block text-ellipsis">{confirmedDate}</span>
                    ) : (
                        <div className="flex flex-row items-center color-primary">
                            <CircleLoader />
                            <div className="ml-2">{c('Wallet transaction').t`In progress`}</div>
                        </div>
                    )}
                </div>
            }
        />
    );
};

export const SenderOrRecipientDataListItem = ({ tx, loading }: TxDataListItemProps) => {
    const isSent = tx.networkData.sent > tx.networkData.received;
    const [addresses] = useAddresses();
    const { walletMap } = useBitcoinBlockchainContext();

    const name = isSent
        ? getTransactionRecipientsHumanReadableName(tx, walletMap, addresses)[0] ?? tx.networkData.outputs[0]?.address
        : getTransactionSenderHumanReadableName(tx, walletMap);

    return (
        <DataListItem
            label={
                isSent
                    ? c('Wallet transactions').ngettext(msgid`Recipient`, `Recipients`, tx.networkData.outputs.length)
                    : c('Wallet transactions').ngettext(msgid`Sender`, `Senders`, tx.networkData.inputs.length)
            }
            bottomNode={
                <div className={clsx('color-hint block text-ellipsis', loading && 'skeleton-loader')}>{name}</div>
            }
        />
    );
};

export const NoteDataListItem = ({
    tx,
    loading,
    onClick,
}: TxDataListItemProps & { onClick: (tx: TransactionData) => void }) => {
    return (
        <DataListItem
            label="Note"
            bottomNode={
                <div className={clsx('flex items-center', loading && 'skeleton-loader')}>
                    <CoreButton
                        shape="ghost"
                        color={tx.apiData?.Label ? 'weak' : 'norm'}
                        className="py-0.5 px-1 color-hint block text-ellipsis"
                        style={{
                            color: !tx.apiData?.Label && 'var(--interaction-norm)',
                            background: 'transparent',
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            onClick(tx);
                        }}
                    >
                        {tx.apiData?.Label || c('Wallet transaction').t`+ Add`}
                    </CoreButton>
                </div>
            }
        />
    );
};

export const AmountDataListItem = ({
    tx,
    loading,
    loadingLabel,
    exchangeRate,
}: TxDataWithExchangeRateListItemProps & { loadingLabel?: boolean }) => {
    const [settings] = useUserWalletSettings();
    const value = tx.networkData.received - tx.networkData.sent;

    return (
        <DataListItem
            align="end"
            label={
                <div className={clsx('ml-auto flex flex-row flex-nowrap', loadingLabel && 'skeleton-loader')}>
                    {exchangeRate ? (
                        <Price unit={exchangeRate} satsAmount={value} />
                    ) : (
                        <span>{c('Wallet transaction').t`Loading`}</span>
                    )}
                </div>
            }
            bottomNode={
                <div
                    className={clsx('block ml-auto color-hint flex flex-row flex-nowrap', loading && 'skeleton-loader')}
                >
                    {convertAmount(value, COMPUTE_BITCOIN_UNIT, settings.BitcoinUnit)}{' '}
                    {getLabelByUnit(settings.BitcoinUnit)}
                </div>
            }
        />
    );
};
