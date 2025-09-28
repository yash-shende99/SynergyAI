import { FC } from 'react';
import { NewsItem } from '../../../types';
import { Newspaper } from 'lucide-react';
// We can reuse the NewsItemCard from our global intelligence module
import NewsItemCard from '../intelligence/NewsItemCard';

interface NewsFeedPanelProps {
  alerts: NewsItem[];
}

const NewsFeedPanel: FC<NewsFeedPanelProps> = ({ alerts }) => (
  <div>
    {alerts.length > 0 ? (
      <div className="space-y-4">
        {alerts.map(alert => <NewsItemCard key={alert.id} alert={alert} />)}
      </div>
    ) : (
      <div className="text-center text-secondary py-16">
        <Newspaper size={48} className="mx-auto mb-4 opacity-30"/>
        <p className="font-semibold">No relevant news found.</p>
      </div>
    )}
  </div>
);

export default NewsFeedPanel;