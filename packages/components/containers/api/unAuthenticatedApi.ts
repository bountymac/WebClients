import metrics from '@proton/metrics';
import {
    auth,
    auth2FA,
    authMnemonic,
    createSession,
    getInfo,
    getMnemonicAuthInfo,
    payload,
    revoke,
    setCookies,
    setRefreshCookies,
} from '@proton/shared/lib/api/auth';
import { getIs401Error } from '@proton/shared/lib/api/helpers/apiErrorHelper';
import { createRefreshHandlers, getIsRefreshFailure, refresh } from '@proton/shared/lib/api/helpers/refreshHandlers';
import { ChallengePayload } from '@proton/shared/lib/authentication/interface';
import { HTTP_ERROR_CODES } from '@proton/shared/lib/errors';
import { getUIDHeaderValue, withAuthHeaders, withUIDHeaders } from '@proton/shared/lib/fetch/headers';
import { getDateHeader } from '@proton/shared/lib/fetch/helpers';
import { setUID } from '@proton/shared/lib/helpers/sentry';
import { getItem, removeItem, setItem } from '@proton/shared/lib/helpers/sessionStorage';
import { Api } from '@proton/shared/lib/interfaces';
import getRandomString from '@proton/utils/getRandomString';

const unAuthStorageKey = 'ua_uid';

export const context: {
    UID: string | undefined;
    auth: boolean;
    api: Api;
    refresh: () => void;
    challenge: ChallengePayload;
} = {
    UID: undefined,
    api: undefined,
    challenge: undefined,
    auth: false,
    refresh: () => {},
} as any;

export const updateUID = (UID: string) => {
    setItem(unAuthStorageKey, UID);

    setUID(UID);
    metrics.setAuthHeaders(UID);

    context.UID = UID;
    context.auth = false;
};

export const init = async () => {
    const response = await context.api<Response>({
        ...createSession(context.challenge ? { Payload: context.challenge } : undefined),
        headers: {
            // This is here because it's required for clients that aren't in the min version
            // And we won't put e.g. the standalone login for apps there
            'x-enforce-unauthsession': true,
        },
        output: 'raw',
    });
    const { UID, AccessToken, RefreshToken } = await response.json();
    await context.api(withAuthHeaders(UID, AccessToken, setCookies({ UID, RefreshToken, State: getRandomString(24) })));
    updateUID(UID);
    return response;
};

export const refreshHandler = createRefreshHandlers((UID: string) => {
    return refresh(
        () =>
            context.api({
                ...withUIDHeaders(UID, setRefreshCookies()),
                output: 'raw',
                silence: 'true',
            }),
        1,
        3
    ).catch((e) => {
        if (getIsRefreshFailure(e)) {
            return init().then((result) => {
                return result;
            });
        }
        throw e;
    });
});

export const setup = async () => {
    const oldUID = getItem(unAuthStorageKey);
    if (oldUID) {
        updateUID(oldUID);
    } else {
        return init();
    }
};

export const clearTabPersistedUID = () => {
    removeItem(unAuthStorageKey);
};

const authConfig = auth({} as any, true);
const infoConfig = getInfo('');
const mnemonicInfo = getMnemonicAuthInfo('');
const mnemonicAuthConfig = authMnemonic('', true);
const auth2FAConfig = auth2FA({ TwoFactorCode: '' });

export const apiCallback: Api = async (config: any) => {
    const UID = context.UID;
    if (!UID) {
        return context.api(config);
    }
    // Note: requestUID !== UID means that this is an API request that is using an already established session, so we ignore unauth here.
    const requestUID = getUIDHeaderValue(config.headers) ?? UID;
    if (requestUID !== UID) {
        return context.api(config);
    }
    // If an unauthenticated session attempts to signs in, the unauthenticated session has to be discarded so it's not
    // accidentally re-used for another session. We do this before the response has returned to avoid race conditions,
    // e.g. a user refreshing the page before the response has come back.
    const isAuthUrl = [authConfig.url, mnemonicAuthConfig.url].includes(config.url);
    if (isAuthUrl) {
        clearTabPersistedUID();
    }
    // If the session has become authenticated, and the user is trying to re-auth, discard the session
    if (context.auth && [infoConfig.url, mnemonicInfo.url].includes(config.url)) {
        try {
            await context.api(withUIDHeaders(UID, { ...revoke(), silence: true }));
            context.auth = false;
        } catch (e) {}
    }
    try {
        const result = await context.api(
            withUIDHeaders(UID, {
                ...config,
                ignoreHandler: [
                    HTTP_ERROR_CODES.UNAUTHORIZED,
                    ...(Array.isArray(config.ignoreHandler) ? config.ignoreHandler : []),
                ],
                silence:
                    config.silence === true
                        ? true
                        : [HTTP_ERROR_CODES.UNAUTHORIZED, ...(Array.isArray(config.silence) ? config.silence : [])],
            })
        );
        if (isAuthUrl) {
            context.auth = true;
        }
        return result;
    } catch (e: any) {
        if (getIs401Error(e)) {
            // Don't attempt to refresh on 2fa failures since the session has become invalidated
            if (config.url === auth2FAConfig.url) {
                throw e;
            }
            return refreshHandler(UID, getDateHeader(e?.response?.headers)).then(() => {
                return apiCallback(config);
            });
        }
        throw e;
    }
};

export const setChallenge = async (data: ChallengePayload) => {
    context.challenge = data;
    await apiCallback(payload(data));
};
