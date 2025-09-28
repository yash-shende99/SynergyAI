import { FC } from 'react';
import { NewsItem } from '../../../types';
import NewsItemCard from './NewsItemCard';
import { Newspaper } from 'lucide-react';

interface NewsFeedPanelProps {
  title: string;
  alerts: NewsItem[];
  description?: string;
  emptyMessage?: string;
}

const NewsFeedPanel: FC<NewsFeedPanelProps> = ({ 
  title, 
  alerts, 
  description,
  emptyMessage = "No news to display." 
}) => (
  <div className="p-4 rounded-xl border border-border bg-surface/50 h-full max-h-[80vh] flex flex-col">
    <div className="p-2 border-b border-border/50 mb-2">
      <h3 className="font-semibold text-white">{title}</h3>
      {description && (
        <p className="text-secondary text-sm mt-1">{description}</p>
      )}
    </div>
    
    <div className="flex-1 overflow-y-auto pr-2">
      {alerts.length > 0 ? (
        <div className="space-y-3">
          {alerts.map(alert => (
            <NewsItemCard key={alert.id} alert={alert} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-secondary text-center">
          <Newspaper size={48} className="mb-4 opacity-30"/>
          <p className="font-semibold text-white">{emptyMessage}</p>
        </div>
      )}
    </div>
  </div>
);

export default NewsFeedPanel;
