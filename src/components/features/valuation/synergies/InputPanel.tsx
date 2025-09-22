import { FC } from 'react';
import { SynergyProfile } from '../../../../types';
import CompanySummaryCard from './CompanySummaryCard';
import AssumptionSliders from './AssumptionSliders';

interface InputPanelProps {
  profile: SynergyProfile;
  setProfile: (profile: SynergyProfile) => void;
}

const InputPanel: FC<InputPanelProps> = ({ profile, setProfile }) => {
    return (
        <div className="p-4 rounded-xl border border-border bg-surface/50 h-full space-y-4">
            <h3 className="font-semibold text-white">Inputs & Assumptions</h3>
            <div className="grid grid-cols-2 gap-4">
                <CompanySummaryCard company={profile.acquirer} label="Acquirer"/>
                <CompanySummaryCard company={profile.target} label="Target"/>
            </div>
            <AssumptionSliders profile={profile} setProfile={setProfile} />
        </div>
    );
};
export default InputPanel;