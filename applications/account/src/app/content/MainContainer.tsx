import { Suspense, lazy, useEffect } from 'react';
import { Redirect, Route, Switch, useLocation } from 'react-router-dom';

import { c } from 'ttag';

import {
    AppLink,
    CancellationReminderSection,
    CustomLogo,
    FeatureCode,
    Logo,
    PassForBusinessLogo,
    PrivateAppContainer,
    PrivateHeader,
    PrivateMainAreaLoading,
    SectionConfig,
    TopBanners,
    TopNavbarUpsell,
    UserDropdown,
    useActiveBreakpoint,
    useAddresses,
    useDeviceRecovery,
    useFeatures,
    useFlag,
    useIsDataRecoveryAvailable,
    useOrganization,
    useOrganizationTheme,
    useRecoveryNotification,
    useSubscription,
    useToggle,
    useUser,
    useUserSettings,
} from '@proton/components';
import ContactEmailsProvider from '@proton/components/containers/contacts/ContactEmailsProvider';
import { getIsSectionAvailable, getSectionPath } from '@proton/components/containers/layout/helper';
import { CANCEL_ROUTE } from '@proton/components/containers/payments/subscription/b2cCancellationFlow/helper';
import { useIsSessionRecoveryAvailable, useShowThemeSelection } from '@proton/components/hooks';
import { getPublicUserProtonAddressApps, getSSOVPNOnlyAccountApps } from '@proton/shared/lib/apps/apps';
import { getAppFromPathnameSafe, getSlugFromApp } from '@proton/shared/lib/apps/slugHelper';
import { getToApp } from '@proton/shared/lib/authentication/apps';
import { stripLocalBasenameFromPathname } from '@proton/shared/lib/authentication/pathnameHelper';
import { APPS, SETUP_ADDRESS_PATH } from '@proton/shared/lib/constants';
import { stripLeadingAndTrailingSlash } from '@proton/shared/lib/helpers/string';
import { getHasPassB2BPlan, hasAIAssistant, hasAllProductsB2CPlan } from '@proton/shared/lib/helpers/subscription';
import { getPathFromLocation } from '@proton/shared/lib/helpers/url';
import { UserModel } from '@proton/shared/lib/interfaces';
import {
    getIsPublicUserWithoutProtonAddress,
    getIsSSOVPNOnlyAccount,
    getRequiresAddressSetup,
} from '@proton/shared/lib/keys';
import { hasPaidPass } from '@proton/shared/lib/user/helpers';

import AccountSettingsRouter from '../containers/account/AccountSettingsRouter';
import OrganizationSettingsRouter from '../containers/organization/OrganizationSettingsRouter';
import AccountSidebar from './AccountSidebar';
import AccountStartupModals from './AccountStartupModals';
import SettingsSearch from './SettingsSearch';
import { getRoutes } from './routes';

const MailSettingsRouter = lazy(
    () => import(/* webpackChunkName: "routers/MailSettingsRouter" */ '../containers/mail/MailSettingsRouter')
);
const CalendarSettingsRouter = lazy(
    () =>
        import(/* webpackChunkName: "routers/CalendarSettingsRouter" */ '../containers/calendar/CalendarSettingsRouter')
);
const VpnSettingsRouter = lazy(
    () => import(/* webpackChunkName: "routers/VpnSettingsRouter" */ '../containers/vpn/VpnSettingsRouter')
);
const DriveSettingsRouter = lazy(
    () => import(/* webpackChunkName: "routers/DriveSettingsRouter" */ '../containers/drive/DriveSettingsRouter')
);
const DocsSettingsRouter = lazy(
    () => import(/* webpackChunkName: "routers/DocsSettingsRouter" */ '../containers/docs/DocsSettingsRouter')
);
const PassSettingsRouter = lazy(
    () => import(/* webpackChunkName: "routers/PassSettingsRouter" */ '../containers/pass/PassSettingsRouter')
);

const mailSlug = getSlugFromApp(APPS.PROTONMAIL);
const calendarSlug = getSlugFromApp(APPS.PROTONCALENDAR);
const vpnSlug = getSlugFromApp(APPS.PROTONVPN_SETTINGS);
const driveSlug = getSlugFromApp(APPS.PROTONDRIVE);
const docsSlug = getSlugFromApp(APPS.PROTONDOCS);
const passSlug = getSlugFromApp(APPS.PROTONPASS);

const getRoutePaths = (prefix: string, sectionConfigs: SectionConfig[]) => {
    return sectionConfigs.map((section) => getSectionPath(prefix, section));
};

const getDefaultPassRedirect = (
    user: UserModel,
    accountRoutes: ReturnType<typeof getRoutes>['account'],
    passRoutes: ReturnType<typeof getRoutes>['pass']
) => {
    if (hasPaidPass(user) || !user.canPay || !getIsSectionAvailable(accountRoutes.routes.dashboard)) {
        return passRoutes.routes.downloads.to;
    }
    return accountRoutes.routes.dashboard.to;
};

const getDefaultRedirect = (accountRoutes: ReturnType<typeof getRoutes>['account']) => {
    if (getIsSectionAvailable(accountRoutes.routes.dashboard)) {
        return accountRoutes.routes.dashboard.to;
    }
    if (getIsSectionAvailable(accountRoutes.routes.recovery)) {
        return accountRoutes.routes.recovery.to;
    }
    if (getIsSectionAvailable(accountRoutes.routes.password)) {
        return accountRoutes.routes.password.to;
    }
    const config = Object.values(accountRoutes.routes).find((config) => {
        if (getIsSectionAvailable(config)) {
            return config;
        }
    });
    return config?.to || '';
};

const MainContainer = () => {
    const [user] = useUser();
    const [userSettings] = useUserSettings();
    const [addresses] = useAddresses();
    const [organization, loadingOrganization] = useOrganization();
    const [subscription, loadingSubscription] = useSubscription();
    const location = useLocation();
    const { state: expanded, toggle: onToggleExpand, set: setExpand } = useToggle();
    const { viewportWidth } = useActiveBreakpoint();

    useFeatures([FeatureCode.EasySwitch]);

    const showThemeSelection = useShowThemeSelection();
    const isBreachesAccountDashboardEnabled = useFlag('BreachesAccountDashboard');
    const isNewCancellationFlowExtended = useFlag('ExtendCancellationProcess');
    const [isDataRecoveryAvailable, loadingDataRecovery] = useIsDataRecoveryAvailable();
    const [isSessionRecoveryAvailable, loadingIsSessionRecoveryAvailable] = useIsSessionRecoveryAvailable();
    const recoveryNotification = useRecoveryNotification(false);

    const appFromPathname = getAppFromPathnameSafe(location.pathname);
    const app = appFromPathname || getToApp(undefined, user);
    const appSlug = getSlugFromApp(app);

    // We hide the assistant upsell for users on Mail and Calendar app without the assistant when the kill switch is enabled
    const hasAssistant = hasAIAssistant(subscription);
    const assistantUpsellKillSwitch = useFlag('AIAssistantToggleKillSwitch');
    const hasAllProducts = hasAllProductsB2CPlan(subscription);
    const isInAllowedApps =
        hasAllProducts || appFromPathname === APPS.PROTONMAIL || appFromPathname === APPS.PROTONCALENDAR;
    const assistantKillSwitch = isInAllowedApps ? !hasAssistant && assistantUpsellKillSwitch : true;

    const organizationTheme = useOrganizationTheme();

    const routes = getRoutes({
        app,
        user,
        addresses,
        organization,
        subscription,
        isReferralProgramEnabled: Boolean(userSettings.Referral?.Eligible),
        isDataRecoveryAvailable,
        isSessionRecoveryAvailable,
        recoveryNotification: recoveryNotification?.color,
        isBreachesAccountDashboardEnabled,
        showThemeSelection,
        isNewCancellationFlowExtended,
        assistantKillSwitch,
    });

    useEffect(() => {
        setExpand(false);
    }, [location.pathname, location.hash]);

    useDeviceRecovery();

    /*
     * There's no logical app to return/go to from VPN settings since the
     * vpn web app is also settings which you are already in. Redirect to
     * the default path in account in that case.
     */
    const isLocal = [APPS.PROTONVPN_SETTINGS].includes(app as any);
    const toApp = isLocal ? APPS.PROTONACCOUNT : app;
    const to = isLocal ? `/${getSlugFromApp(app)}` : '/';
    const prefixPath = `/${appSlug}`;

    const hasPassB2bPlan = getHasPassB2BPlan(subscription);

    const getLogo = () => {
        if (organizationTheme.logoURL) {
            return (
                <CustomLogo
                    url={organizationTheme.logoURL}
                    app={app}
                    organizationName={organizationTheme.name}
                    organizationNameDataTestId="sidebar:organization-name"
                />
            );
        }

        if (app === APPS.PROTONPASS && hasPassB2bPlan) {
            return <PassForBusinessLogo />;
        }

        return <Logo appName={app} />;
    };

    const logo = (
        <AppLink
            to={to}
            toApp={toApp}
            target="_self"
            className="relative interactive-pseudo-protrude interactive--no-background text-no-decoration rounded-lg"
        >
            {getLogo()}
        </AppLink>
    );

    const top = <TopBanners app={app} />;

    const header = (
        <PrivateHeader
            userDropdown={<UserDropdown app={app} />}
            // No onboarding in account
            upsellButton={<TopNavbarUpsell offerProps={{ ignoreOnboarding: true }} app={app} />}
            title={c('Title').t`Settings`}
            expanded={expanded}
            onToggleExpand={onToggleExpand}
            isSmallViewport={viewportWidth['<=small']}
            actionArea={viewportWidth['>=large'] && <SettingsSearch routes={routes} path={prefixPath} app={app} />}
            app={app}
        />
    );

    const sidebar = (
        <AccountSidebar
            app={app}
            appSlug={appSlug}
            logo={logo}
            expanded={expanded}
            onToggleExpand={onToggleExpand}
            routes={routes}
        />
    );

    // Switch can't reasonably traverse Router childrens. However we do want to place them in their own components
    // and still have redirects working. This is a trick to short-circuit matches of these paths to specific routers.
    // A better idea would be to use a prefix for account and org. /mail/account/dashboard etc.
    const anyAccountAppRoute = getRoutePaths(prefixPath, Object.values(routes.account.routes));
    const anyOrganizationAppRoute = getRoutePaths(
        prefixPath,
        Object.values(routes.organization.routes).filter((section) => {
            // Filter out the domains section, the route clashes with the _same_ route in the mail router when
            // it's not available and would take precedence in the routing. (E.g. for free users).
            return !(section === routes.organization.routes.domains && !getIsSectionAvailable(section));
        })
    );

    const redirect = (() => {
        if (loadingOrganization || loadingSubscription || loadingDataRecovery || loadingIsSessionRecoveryAvailable) {
            return <PrivateMainAreaLoading />;
        }

        if (!appFromPathname) {
            return <Redirect to={`/${appSlug}${getPathFromLocation(location)}`} />;
        }

        const path = (() => {
            if (app === APPS.PROTONPASS) {
                return getDefaultPassRedirect(user, routes.account, routes.pass);
            }
            return getDefaultRedirect(routes.account);
        })();

        return <Redirect to={`/${appSlug}${path}`} />;
    })();

    if (getRequiresAddressSetup(app, user)) {
        const toPath = `/${stripLeadingAndTrailingSlash(stripLocalBasenameFromPathname(location.pathname))}`;
        return <Redirect to={`${SETUP_ADDRESS_PATH}?to=${app}&to-type=settings&to-path=${toPath}`} />;
    }

    if (getIsSSOVPNOnlyAccount(user)) {
        if (!getSSOVPNOnlyAccountApps().includes(appFromPathname!)) {
            return <Redirect to={`/${getSlugFromApp(APPS.PROTONVPN_SETTINGS)}`} />;
        }
    } else if (getIsPublicUserWithoutProtonAddress(user)) {
        if (!getPublicUserProtonAddressApps().includes(appFromPathname!)) {
            return <Redirect to={`/${getSlugFromApp(APPS.PROTONPASS)}`} />;
        }
    }

    return (
        <PrivateAppContainer top={top} header={header} sidebar={sidebar}>
            <AccountStartupModals />
            <Switch>
                <Route path={anyAccountAppRoute}>
                    <AccountSettingsRouter
                        app={app}
                        path={prefixPath}
                        accountAppRoutes={routes.account}
                        redirect={redirect}
                    />
                </Route>
                <Route path={anyOrganizationAppRoute}>
                    <OrganizationSettingsRouter
                        app={app}
                        path={prefixPath}
                        organizationAppRoutes={routes.organization}
                        redirect={redirect}
                    />
                </Route>
                <Route path={`/${appSlug}${CANCEL_ROUTE}`}>
                    <CancellationReminderSection app={app} />
                </Route>
                <Route path={`/${mailSlug}`}>
                    <Suspense fallback={<PrivateMainAreaLoading />}>
                        <MailSettingsRouter mailAppRoutes={routes.mail} redirect={redirect} />
                    </Suspense>
                </Route>
                <Route path={`/${calendarSlug}`}>
                    <Suspense fallback={<PrivateMainAreaLoading />}>
                        <ContactEmailsProvider>
                            <CalendarSettingsRouter
                                user={user}
                                subscription={subscription}
                                calendarAppRoutes={routes.calendar}
                                redirect={redirect}
                            />
                        </ContactEmailsProvider>
                    </Suspense>
                </Route>
                <Route path={`/${vpnSlug}`}>
                    <Suspense fallback={<PrivateMainAreaLoading />}>
                        <VpnSettingsRouter vpnAppRoutes={routes.vpn} redirect={redirect} />
                    </Suspense>
                </Route>
                <Route path={`/${driveSlug}`}>
                    <Suspense fallback={<PrivateMainAreaLoading />}>
                        <DriveSettingsRouter driveAppRoutes={routes.drive} redirect={redirect} />
                    </Suspense>
                </Route>
                <Route path={`/${docsSlug}`}>
                    <Suspense fallback={<PrivateMainAreaLoading />}>
                        <DocsSettingsRouter docsAppRoutes={routes.docs} redirect={redirect} />
                    </Suspense>
                </Route>
                <Route path={`/${passSlug}`}>
                    <Suspense fallback={<PrivateMainAreaLoading />}>
                        <PassSettingsRouter passAppRoutes={routes.pass} redirect={redirect} />
                    </Suspense>
                </Route>
                {redirect}
            </Switch>
        </PrivateAppContainer>
    );
};

export default MainContainer;
