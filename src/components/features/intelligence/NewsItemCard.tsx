import { FC } from 'react';
import { NewsItem } from '../../../types';
import { ExternalLink, Clock, Building2 } from 'lucide-react';

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'Critical': return 'border-l-4 border-l-red-500 bg-red-500/10';
    case 'High': return 'border-l-4 border-l-orange-500 bg-orange-500/10';
    case 'Medium': return 'border-l-4 border-l-amber-500 bg-amber-500/10';
    default: return 'border-l-4 border-l-gray-500 bg-gray-500/10';
  }
};

const NewsItemCard: FC<{ alert: NewsItem }> = ({ alert }) => {
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={`p-3 rounded-lg bg-background/50 transition-all hover:bg-surface/80 border-l-4 ${getPriorityColor(alert.priority)}`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center space-x-2">
          <Building2 className="h-3 w-4 text-secondary" />
          <span className="text-xs font-medium text-primary">{alert.companyName}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-secondary">{alert.priority}</span>
          <Clock className="h-3 w-3 text-secondary" />
          <span className="text-xs text-secondary">{formatDate(alert.timestamp)}</span>
          {alert.isLive && (
            <span className="px-1.5 py-0.5 bg-green-500/20 text-green-400 text-xs rounded">LIVE</span>
          )}
        </div>
      </div>
      
      <p className="text-white text-sm font-medium mb-2 line-clamp-2">{alert.title}</p>
      
      <div className="flex justify-between items-center">
        <span className="text-xs text-secondary truncate">Source: {alert.source}</span>
        {alert.url && alert.url !== '#' && (
          <a href={alert.url} target="_blank" rel="noopener noreferrer" className="flex items-center text-xs text-primary hover:underline">
            <ExternalLink className="h-3 w-3 mr-1" />
            Read
          </a>
        )}
      </div>
    </div>
  );
};

export default NewsItemCard;