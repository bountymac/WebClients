import { memo } from 'react';

import {
    AppLink,
    AppVersion,
    AppsDropdown,
    Sidebar,
    SidebarList,
    SidebarNav,
    UserDropdown,
    useActiveBreakpoint,
} from '@proton/components';
import { APPS, WALLET_APP_NAME } from '@proton/shared/lib/constants';
import protonWalletLogo from '@proton/styles/assets/img/illustrations/proton-wallet-logo.svg';
import { IWasmApiWalletData } from '@proton/wallet';

import { APP_NAME } from '../../../config';
import { OtherSidebarListItems } from './OtherSidebarListItems';
import { WalletsSidebarList } from './WalletsSidebarList';

import './WalletSidebar.scss';

interface Props {
    expanded?: boolean;
    loadingApiWalletsData?: boolean;
    apiWalletsData?: IWasmApiWalletData[];
    onToggleExpand?: () => void;
    onAddWallet: () => void;
    onAddWalletAccount: (apiWalletData: IWasmApiWalletData) => void;
}

const { PROTONWALLET: PROTONWALLET_APP } = APPS;

const WalletSidebar = ({
    expanded = false,
    loadingApiWalletsData = false,
    apiWalletsData,
    onAddWallet,
    onAddWalletAccount,
    onToggleExpand,
}: Props) => {
    const { viewportWidth } = useActiveBreakpoint();

    return (
        <Sidebar
            app={PROTONWALLET_APP}
            expanded={expanded}
            onToggleExpand={onToggleExpand}
            appsDropdown={<AppsDropdown app={PROTONWALLET_APP} />}
            logo={
                <AppLink
                    to="/"
                    toApp={APP_NAME}
                    target="_self"
                    className="relative interactive-pseudo-protrude interactive--no-background"
                >
                    <img src={protonWalletLogo} alt={WALLET_APP_NAME} />
                </AppLink>
            }
            version={<AppVersion />}
            showStorage={false}
            className="wallet-sidebar-overide bg-weak"
        >
            <SidebarNav className="flex">
                <div className="outline-none flex flex-column justify-space-between grow max-h-full">
                    <div className="grow max-w-full max-h-full overflow-hidden">
                        <SidebarList className="flex flex-column max-h-full overflow-hidden flex-nowrap">
                            {/* Sidebar already mounts UserDropdown when viewportWidth['<=small'] is true */}
                            {!viewportWidth['<=small'] && (
                                <div className="user-dropdown-override mx-3 mb-3">
                                    <UserDropdown app={PROTONWALLET_APP} />
                                </div>
                            )}

                            <WalletsSidebarList
                                loadingApiWalletsData={loadingApiWalletsData}
                                apiWalletsData={apiWalletsData}
                                onAddWalletAccount={onAddWalletAccount}
                                onAddWallet={onAddWallet}
                            />

                            <hr className="my-7 w-full" />

                            <OtherSidebarListItems />
                        </SidebarList>
                    </div>
                </div>
            </SidebarNav>
        </Sidebar>
    );
};

export default memo(WalletSidebar);
