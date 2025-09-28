import { FC } from 'react';
import { IndustryIntelligenceData } from '../../../../types';
import MarketTrendsPanel from './MarketTrendsPanel';
import NewsPanel from './NewsPanel';

const IndustryUpdatesDashboard: FC<{ data: IndustryIntelligenceData }> = ({ data }) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-white">Industry Briefing: {data.sector}</h2>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="lg:col-span-1">
        <MarketTrendsPanel trends={data.marketTrends} />
      </div>
      <div className="lg:col-span-1 space-y-6">
        <NewsPanel title="Industry News" items={data.industryNews} />
        {/* We can add Regulatory and Competitor panels here in the future */}
      </div>
    </div>
  </div>
);

export default IndustryUpdatesDashboard;
