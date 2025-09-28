import { FC } from 'react';
import { MarketIndicator } from '../../../../types';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const IndicatorCard: FC<{ indicator: MarketIndicator }> = ({ indicator }) => (
  <div className="p-4 rounded-xl border border-border bg-surface/50">
    <p className="text-sm text-secondary">{indicator.name}</p>
    <div className="flex items-baseline gap-2 mt-1">
      <p className="text-2xl font-bold text-white">{indicator.value}</p>
      <div className={`flex items-center text-sm font-semibold ${indicator.isPositive ? 'text-green-400' : 'text-red-400'}`}>
        {indicator.isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
        <span>{indicator.change}</span>
      </div>
    </div>
  </div>
);

export default IndicatorCard;
