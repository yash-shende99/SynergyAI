import { FC } from 'react';
import { PiggyBank, TrendingUp } from 'lucide-react';
import { SynergyItem } from '../../../../types';

interface SynergyBreakdownCardProps {
  title: string;
  iconType: 'cost' | 'revenue';
  data: SynergyItem[];
}

const SynergyBreakdownCard: FC<SynergyBreakdownCardProps> = ({ title, iconType, data }) => {
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);
  return (
    <div className="p-4 rounded-xl border border-border bg-surface/50">
      <div className="flex items-center gap-3 mb-4">
        {iconType === 'cost' ? <PiggyBank className="h-6 w-6 text-blue-400"/> : <TrendingUp className="h-6 w-6 text-green-400"/>}
        <h3 className="font-bold text-white">{title}</h3>
      </div>
      {/* Placeholder for stacked bar */}
      <div className="w-full h-4 bg-background/50 rounded-full flex overflow-hidden mb-4">
          <div className="bg-blue-500" style={{width: '30%'}}></div>
          <div className="bg-blue-400" style={{width: '25%'}}></div>
          <div className="bg-blue-300" style={{width: '20%'}}></div>
      </div>
      <div className="space-y-2">
        {data.map(item => (
          <div key={item.name} className="flex justify-between items-center text-sm">
            <span className="text-secondary">{item.name}</span>
            <span className="font-semibold text-white">${item.value}M <span className="text-xs text-green-400">({item.confidence})</span></span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SynergyBreakdownCard;