import { FC } from 'react';
import { MarketIntelligenceData } from '../../../../types';
import IndicatorCard from './IndicatorCard';
import SectorSpotlight from './SectorSpotlight';
import TopMovers from './TopMovers';

const MarketIntelligenceDashboard: FC<{ data: MarketIntelligenceData }> = ({ data }) => (
  <div className="space-y-6">
    {/* Key Market Indicators */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {data.indicators.map(indicator => (
        <IndicatorCard key={indicator.name} indicator={indicator} />
      ))}
    </div>

    {/* Main Panels */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <SectorSpotlight trends={data.sectorTrends} />
      </div>
      <div>
        <TopMovers gainers={data.topGainers} losers={data.topLosers} />
      </div>
    </div>
  </div>
);

export default MarketIntelligenceDashboard;
