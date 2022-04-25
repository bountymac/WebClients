import { c } from 'ttag';
import { Meter } from '@proton/components';
import { PLANS, PLAN_NAMES } from '@proton/shared/lib/constants';

interface Props {
    rewards: number;
    rewardsLimit: number;
}

const RewardsProgress = ({ rewards, rewardsLimit }: Props) => {
    const planName = PLAN_NAMES[PLANS.MAIL];

    return (
        <div className="flex flex-justify-space-between flex-align-items-center flex-gap-1 on-tablet-flex-column">
            <div className="flex-item-fluid">
                <b>{c('Info').t`${planName} credits earned`}</b>
            </div>
            <div className="flex-item-fluid">
                {rewards > 0 && (
                    <Meter
                        value={rewards}
                        max={rewardsLimit}
                        // translator: The months are free months of mailplus subscription. Full sentence can be something like this : "Earned 5 of 18 Mail Plus months"
                        title={c('Info').t`Earned ${rewards} of ${rewardsLimit} ${planName} months.`}
                    />
                )}
            </div>
            <div className="flex-item-fluid text-right">{
                // translator: The months are free months of mailplus subscription. Full sentence can be something like this : "8 of 18 months"
                c('Info').t`${rewards} of ${rewardsLimit} months`
            }</div>
        </div>
    );
};

export default RewardsProgress;
