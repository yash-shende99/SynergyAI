import { FC } from 'react';
import { MarketMover } from '../../../../types';
import { TrendingUp, TrendingDown } from 'lucide-react';

const MoverItem: FC<{ mover: MarketMover }> = ({ mover }) => (
  <div className="flex items-center justify-between p-2 rounded hover:bg-surface/50">
    <div className="flex items-center gap-3">
      <img src={mover.logoUrl} alt={mover.name} className="h-8 w-8 rounded-full bg-white p-1" />
      <span className="text-sm font-medium text-white">{mover.name}</span>
    </div>
    <span className={`font-semibold text-sm ${mover.changePercent > 0 ? 'text-green-400' : 'text-red-400'}`}>
      {mover.changePercent > 0 ? '+' : ''}{mover.changePercent.toFixed(1)}%
    </span>
  </div>
);

const TopMovers: FC<{ gainers: MarketMover[], losers: MarketMover[] }> = ({ gainers, losers }) => (
  <div className="p-6 rounded-xl border border-border bg-surface/50 h-full">
    <div className="grid grid-cols-2 gap-4">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp size={16} className="text-green-400" />
          <h4 className="font-semibold text-white text-sm">Top Gainers</h4>
        </div>
        <div className="space-y-1">
          {gainers.map(g => <MoverItem key={g.name} mover={g} />)}
        </div>
      </div>
      <div>
        <div className="flex items-center gap-2 mb-2">
          <TrendingDown size={16} className="text-red-400" />
          <h4 className="font-semibold text-white text-sm">Top Losers</h4>
        </div>
        <div className="space-y-1">
          {losers.map(l => <MoverItem key={l.name} mover={l} />)}
        </div>
      </div>
    </div>
  </div>
);

export default TopMovers;
