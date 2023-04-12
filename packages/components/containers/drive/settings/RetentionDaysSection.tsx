import { c, msgid } from 'ttag';

import { Button } from '@proton/atoms/Button';
import {
    Radio,
    RevisionsUpgradeBanner,
    Tooltip,
    useConfirmActionModal,
    useRevisionRetentionDays,
    useUser,
} from '@proton/components';
import type { RevisionRetentionDaysSetting } from '@proton/shared/lib/interfaces/drive/userSettings';
import clsx from '@proton/utils/clsx';

const RetentionDaysSection = () => {
    const [{ hasPaidDrive }] = useUser();
    const [confirmActionModal, showConfirmActionModal] = useConfirmActionModal();
    const { revisionRetentionDays, hasValueChanged, isLoading, isSubmitLoading, handleSubmit, handleChange } =
        useRevisionRetentionDays(hasPaidDrive, showConfirmActionModal);

    const retentionLabelForDays = (nbDay: number) => c('Label').ngettext(msgid`${nbDay} day`, `${nbDay} days`, nbDay);
    const retentionLabelForYears = (nbYear: number) =>
        c('Label').ngettext(msgid`${nbYear} year`, `${nbYear} years`, nbYear);

    const options: {
        value: RevisionRetentionDaysSetting;
        label: string;
        disabled?: boolean;
    }[] = [
        {
            value: 0,
            label: c('Label').t`Don't keep versions`,
            disabled: !hasPaidDrive,
        },
        { value: 7, label: retentionLabelForDays(7) },
        { value: 30, label: retentionLabelForDays(30), disabled: !hasPaidDrive },
        { value: 180, label: retentionLabelForDays(180), disabled: !hasPaidDrive },
        { value: 365, label: retentionLabelForDays(365), disabled: !hasPaidDrive },
        { value: 3650, label: retentionLabelForYears(10), disabled: !hasPaidDrive },
    ];

    return (
        <div className="w500p">
            {!hasPaidDrive ? <RevisionsUpgradeBanner /> : null}
            <form className="flex flex-column flex-align-items-start flex-gap-0-5 mt-6" onSubmit={handleSubmit}>
                {options.map((option) => {
                    const id = option.value.toString();
                    const radioProps = {
                        onChange: () => handleChange(option.value),
                        id,
                        name: option.label,
                        disabled: isLoading || isSubmitLoading || option.disabled,
                        checked: !isLoading && revisionRetentionDays === option.value,
                        className: clsx(
                            'w100 block border rounded p-3',
                            !isLoading && revisionRetentionDays === option.value ? 'border-primary' : 'border-norm'
                        ),
                    };

                    if (option.value !== 7 && !hasPaidDrive) {
                        return (
                            <Tooltip key={id} title={c('Info').t`Upgrade to unlock`} originalPlacement="right">
                                <div className="w100">
                                    <Radio {...radioProps}>{option.label}</Radio>
                                </div>
                            </Tooltip>
                        );
                    }
                    return (
                        <Radio key={id} {...radioProps}>
                            {option.label}
                        </Radio>
                    );
                })}
                <Button
                    className="mt-6"
                    type="submit"
                    size="large"
                    color="norm"
                    loading={isSubmitLoading}
                    disabled={!hasValueChanged}
                >{c('Action').t`Save changes`}</Button>
            </form>
            {confirmActionModal}
        </div>
    );
};

export default RetentionDaysSection;
