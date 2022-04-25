import { localeCode } from '@proton/shared/lib/i18n';
import { loadDateLocale, loadLocale } from '@proton/shared/lib/i18n/loadLocale';
import { getSecondLevelDomain } from '@proton/shared/lib/helpers/url';
import { getBrowserLocale, getClosestLocaleCode } from '@proton/shared/lib/i18n/helper';
import { TtagLocaleMap } from '@proton/shared/lib/interfaces/Locale';
import { setCookie } from '@proton/shared/lib/helpers/cookies';
import { addDays } from 'date-fns';
import { useConfig, useForceRefresh, DropdownMenu, DropdownMenuButton, SimpleDropdown } from '@proton/components';

interface Props {
    className?: string;
    locales?: TtagLocaleMap;
}

const cookieDomain = `.${getSecondLevelDomain(window.location.hostname)}`;
const LanguageSelect = ({ className, locales = {} }: Props) => {
    const forceRefresh = useForceRefresh();
    const { LOCALES = {} } = useConfig();
    const handleChange = async (newLocale: string) => {
        const localeCode = getClosestLocaleCode(newLocale, locales);
        await Promise.all([loadLocale(localeCode, locales), loadDateLocale(localeCode, getBrowserLocale())]);
        setCookie({
            cookieName: 'Locale',
            cookieValue: localeCode,
            expirationDate: addDays(new Date(), 30).toUTCString(),
            cookieDomain,
        });
        forceRefresh();
    };

    return (
        <SimpleDropdown as="button" type="button" content={LOCALES[localeCode]} className={className}>
            <DropdownMenu>
                {Object.keys(LOCALES).map((value) => (
                    <DropdownMenuButton className="text-left" key={value} onClick={() => handleChange(value)}>
                        {LOCALES[value]}
                    </DropdownMenuButton>
                ))}
            </DropdownMenu>
        </SimpleDropdown>
    );
};

export default LanguageSelect;
