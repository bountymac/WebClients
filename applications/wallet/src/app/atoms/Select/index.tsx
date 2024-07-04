import { MutableRefObject, ReactNode, useRef } from 'react';

import Option from '@proton/components/components/option/Option';
import CoreSearchableSelect, {
    Props as _CoreSearchableSelectProps,
} from '@proton/components/components/selectTwo/SearchableSelect';
import SelectTwo, { Props as SelectTwoProps } from '@proton/components/components/selectTwo/SelectTwo';
import InputField, { InputFieldOwnProps } from '@proton/components/components/v2/field/InputField';
import clsx from '@proton/utils/clsx';

import './Select.scss';

type Props<V> = Omit<
    SelectTwoProps<V> & InputFieldOwnProps,
    'children' | 'assistContainerClassName' | 'labelContainerClassName' | 'originalPlacement' | 'unstyled' | 'prefix'
> & {
    options: { id: string; value: V; label: string; disabled?: boolean; children?: ReactNode }[];
    label?: string | JSX.Element;
    bordered?: boolean;
    containerClassName?: string;
    prefix?: JSX.Element;
};

export const Select = <V extends unknown>({ options, bordered, containerClassName, prefix, ...props }: Props<V>) => {
    const selectRef = useRef<HTMLDivElement>(null);

    return (
        <div
            className={clsx(
                'wallet-select flex flex-row items-center flex-nowrap bg-weak py-5 px-4 rounded-xl color-norm w-full',
                bordered && 'bordered',
                props.disabled && 'disabled',
                containerClassName
            )}
            ref={selectRef}
        >
            {prefix}
            <InputField<typeof SelectTwo<V>>
                as={SelectTwo}
                dropdownClassName="wallet-select-dropdown"
                assistContainerClassName="empty:hidden"
                labelContainerClassName="expand-click-area color-hint m-0 text-normal text-sm"
                originalPlacement="bottom"
                unstyled
                anchorRef={selectRef as MutableRefObject<any>}
                {...props}
            >
                {options.map((opt) => (
                    <Option key={opt.id} title={opt.label} value={opt.value} disabled={opt.disabled}>
                        {opt.children}
                    </Option>
                ))}
            </InputField>
        </div>
    );
};

export type CoreSearchableSelectProps<V> = _CoreSearchableSelectProps<V>;

type SearchableSelectProps<V> = CoreSearchableSelectProps<V> & {
    label: string | JSX.Element;
    hint?: string;
    bordered?: boolean;
    containerClassName?: string;
    anchorRef?: MutableRefObject<HTMLButtonElement | null>;
};

export const SearchableSelect = <V extends unknown>({
    bordered,
    containerClassName,
    ...props
}: SearchableSelectProps<V>) => {
    const selectRef = useRef<HTMLDivElement>(null);

    return (
        <div
            className={clsx(
                'wallet-select wallet-select-dropdown-button bg-weak py-5 px-4 rounded-xl color-norm w-full',
                bordered && 'bordered',
                props.disabled && 'disabled',
                containerClassName
            )}
            ref={selectRef}
        >
            <InputField
                as={CoreSearchableSelect<V>}
                dropdownClassName="wallet-select-dropdown"
                assistContainerClassName="empty:hidden"
                labelContainerClassName="expand-click-area color-hint m-0 text-normal text-sm"
                originalPlacement="bottom"
                availablePlacements={['bottom']}
                unstyled
                anchorRef={selectRef as MutableRefObject<any>}
                {...props}
            />
        </div>
    );
};

interface SelectOptionProps {
    label: string;
    description?: string;
}

export const SelectOption = ({ label, description }: SelectOptionProps) => {
    return (
        <>
            <span className="block">{label}</span>
            {!!description && <span className="text-sm color-weak">{description}</span>}
        </>
    );
};
