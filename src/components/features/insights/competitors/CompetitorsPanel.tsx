// components/features/insights/Competitors/CompetitorsPanel.tsx
import { FC } from 'react';
import { NewsItem } from '../../../../types';
import NewsItemCard from '../../intelligence/NewsItemCard';
import { Users } from 'lucide-react';

interface CompetitorsPanelProps {
  competitorsNews: NewsItem[];
}

const CompetitorsPanel: FC<CompetitorsPanelProps> = ({ competitorsNews }) => (
  <div className="space-y-6">
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-white mb-2">Competitor News</h1>
      <p className="text-secondary">Latest updates about competitors and market landscape</p>
    </div>
    
    {competitorsNews.length > 0 ? (
      <div className="space-y-4">
        {competitorsNews.map(alert => (
          <NewsItemCard key={alert.id} alert={alert} />
        ))}
      </div>
    ) : (
      <div className="text-center text-secondary py-16">
        <Users size={48} className="mx-auto mb-4 opacity-30"/>
        <p className="font-semibold">No competitor news found.</p>
        <p className="text-sm mt-1">News about competitors will appear here.</p>
      </div>
    )}
  </div>
);

export default CompetitorsPanel;