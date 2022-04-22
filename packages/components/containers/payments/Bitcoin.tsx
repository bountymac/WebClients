import { ReactNode, useEffect, useState } from 'react';
import { c } from 'ttag';
import { createBitcoinPayment, createBitcoinDonation } from '@proton/shared/lib/api/payments';
import { MIN_BITCOIN_AMOUNT, APPS } from '@proton/shared/lib/constants';
import { Currency } from '@proton/shared/lib/interfaces';
import { getKnowledgeBaseUrl } from '@proton/shared/lib/helpers/url';

import { Alert, Price, Button, Loader, Bordered, Href } from '../../components';
import { useConfig, useApi, useLoading } from '../../hooks';
import BitcoinQRCode from './BitcoinQRCode';
import BitcoinDetails from './BitcoinDetails';

interface Props {
    amount: number;
    currency: Currency;
    type: string;
}

const Bitcoin = ({ amount, currency, type }: Props) => {
    const api = useApi();
    const { APP_NAME } = useConfig();
    const [loading, withLoading] = useLoading();
    const [error, setError] = useState(false);
    const [model, setModel] = useState({ amountBitcoin: 0, address: '' });

    const request = async () => {
        setError(false);
        try {
            const { AmountBitcoin, Address } = await api(
                type === 'donation' ? createBitcoinDonation(amount, currency) : createBitcoinPayment(amount, currency)
            );
            setModel({ amountBitcoin: AmountBitcoin, address: Address });
        } catch (error) {
            setError(true);
            throw error;
        }
    };

    useEffect(() => {
        if (amount >= MIN_BITCOIN_AMOUNT) {
            withLoading(request());
        }
    }, [amount, currency]);

    if (amount < MIN_BITCOIN_AMOUNT) {
        const i18n = (amount: ReactNode) => c('Info').jt`Amount below minimum (${amount}).`;
        return (
            <Alert className="mb1" type="warning">
                {i18n(
                    <Price key="price" currency={currency}>
                        {MIN_BITCOIN_AMOUNT}
                    </Price>
                )}
            </Alert>
        );
    }

    if (loading) {
        return <Loader />;
    }

    if (error || !model.amountBitcoin || !model.address) {
        return (
            <>
                <Alert className="mb1" type="error">{c('Error').t`Error connecting to the Bitcoin API.`}</Alert>
                <Button onClick={() => withLoading(request())}>{c('Action').t`Try again`}</Button>
            </>
        );
    }

    return (
        <Bordered className="bg-weak rounded">
            <div className="p1 border-bottom">
                <BitcoinQRCode
                    className="flex flex-align-items-center flex-column"
                    amount={model.amountBitcoin}
                    address={model.address}
                />
            </div>
            <BitcoinDetails amount={model.amountBitcoin} address={model.address} />
            <div className="pt1 pl1 pr1">
                {type === 'invoice' ? (
                    <div className="mb1">{c('Info')
                        .t`Bitcoin transactions can take some time to be confirmed (up to 24 hours). Once confirmed, we will add credits to your account. After transaction confirmation, you can pay your invoice with the credits.`}</div>
                ) : (
                    <div className="mb1">
                        {c('Info')
                            .t`After making your Bitcoin payment, please follow the instructions below to upgrade.`}
                        <div>
                            <Href
                                url={
                                    APP_NAME === APPS.PROTONVPN_SETTINGS
                                        ? 'https://protonvpn.com/support/vpn-bitcoin-payments/'
                                        : getKnowledgeBaseUrl('/paying-with-bitcoin')
                                }
                            >{c('Link').t`Learn more`}</Href>
                        </div>
                    </div>
                )}
            </div>
        </Bordered>
    );
};

export default Bitcoin;
