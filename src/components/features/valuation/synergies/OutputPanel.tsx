import { FC } from 'react';
import { SynergyProfile } from '../../../../types';
import { PiggyBank, TrendingUp, Gem, Clock } from 'lucide-react';

const OutputPanel: FC<{ profile: SynergyProfile }> = ({ profile }) => {
    const costSynergies = 50; // Mock calculation
    const revenueSynergies = 70;
    const netValue = costSynergies + revenueSynergies - profile.variables.integrationCosts;
    return (
        <div className="p-4 rounded-xl border border-border bg-surface/50 h-full">
             <h3 className="font-semibold text-white mb-4">AI-Generated Synergy Estimates</h3>
             <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 bg-background/50 rounded-lg"><p className="text-xs text-secondary flex items-center gap-2"><PiggyBank size={14}/>Cost Synergies</p><p className="text-lg font-bold text-blue-400">${costSynergies}M</p></div>
                <div className="p-3 bg-background/50 rounded-lg"><p className="text-xs text-secondary flex items-center gap-2"><TrendingUp size={14}/>Revenue Synergies</p><p className="text-lg font-bold text-green-400">${revenueSynergies}M</p></div>
                <div className="p-3 bg-background/50 rounded-lg"><p className="text-xs text-secondary flex items-center gap-2"><Gem size={14}/>Net Value Creation</p><p className="text-lg font-bold text-white">${netValue}M</p></div>
                <div className="p-3 bg-background/50 rounded-lg"><p className="text-xs text-secondary flex items-center gap-2"><Clock size={14}/>Payback Period</p><p className="text-lg font-bold text-white">{profile.variables.timeToRealize} Years</p></div>
             </div>
             <div className="h-48 bg-background/50 rounded-lg flex items-center justify-center">
                <p className="text-secondary text-sm">[Waterfall & Pie Chart Visualizations]</p>
             </div>
        </div>
    );
};
export default OutputPanel;