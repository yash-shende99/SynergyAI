import { FC } from 'react';
import { SynergyProfile } from '../../../../types';
import VariableSlider from '../scenarios/VariableSlider'; // Reusing our slider
import {Button} from '../../../ui/button';
import { Sparkles } from 'lucide-react';

const AssumptionSliders: FC<{profile: SynergyProfile, setProfile: (p: SynergyProfile) => void}> = ({profile, setProfile}) => {
    const handleVarChange = (variable: keyof SynergyProfile['variables'], value: number) => {
        setProfile({ ...profile, variables: { ...profile.variables, [variable]: value } });
    };

    return (
        <div className="space-y-4 pt-4 border-t border-border">
            <VariableSlider label="Cost Reduction" value={profile.variables.costReduction} onChange={v => handleVarChange('costReduction', v)} min={0} max={30} step={1} unit="%"/>
            <VariableSlider label="Revenue Growth" value={profile.variables.revenueGrowth} onChange={v => handleVarChange('revenueGrowth', v)} min={0} max={20} step={1} unit="%"/>
            <VariableSlider label="Integration Costs" value={profile.variables.integrationCosts} onChange={v => handleVarChange('integrationCosts', v)} min={10} max={100} step={5} unit="$M"/>
            <div className="text-right">
                <Button variant="ghost" size="sm"><Sparkles size={14} className="mr-2"/>Suggest with AI</Button>
            </div>
        </div>
    );
};
export default AssumptionSliders;