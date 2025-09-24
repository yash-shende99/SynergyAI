import { FC } from 'react';
import { SynergySubScore } from '../../../../types';
import { DollarSign, BrainCircuit, ShieldAlert } from 'lucide-react';

const getIcon = (category: SynergySubScore['category']) => {
  if (category === 'Financial Synergy') return <DollarSign className="h-5 w-5 text-blue-400" />;
  if (category === 'Strategic Fit') return <BrainCircuit className="h-5 w-5 text-purple-400" />;
  return <ShieldAlert className="h-5 w-5 text-amber-400" />;
};

const SubScoreCard: FC<{ subScore: SynergySubScore }> = ({ subScore }) => (
    <div className="p-3 rounded-lg bg-background/50 border border-border/50">
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
                {getIcon(subScore.category)}
                <h4 className="text-sm font-semibold text-white">{subScore.category}</h4>
            </div>
            <p className="text-lg font-bold text-white">{subScore.score}<span className="text-xs text-secondary">/100</span></p>
        </div>
        <p className="text-xs text-secondary mt-1 pl-7">{subScore.summary}</p>
    </div>
);
export default SubScoreCard;