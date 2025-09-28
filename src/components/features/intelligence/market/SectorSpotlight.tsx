import { FC } from 'react';
import { SectorTrend } from '../../../../types';
import { Bot } from 'lucide-react';

const SectorSpotlight: FC<{ trends: SectorTrend[] }> = ({ trends }) => (
  <div className="p-6 rounded-xl border border-border bg-surface/50 h-full">
    <div className="flex items-center gap-3 mb-4">
      <Bot className="h-6 w-6 text-primary"/>
      <h3 className="text-lg font-bold text-white">AI Sector Spotlight</h3>
    </div>
    <div className="space-y-4">
      {trends.map(trend => (
        <div key={trend.sector} className="p-3 rounded-lg bg-background/50">
          <p className="font-semibold text-white text-sm">{trend.sector}</p>
          <p className="text-xs text-secondary mt-1">{trend.trend}</p>
        </div>
      ))}
    </div>
  </div>
);

export default SectorSpotlight;
