import { FC } from 'react';
import { NewsItem } from '../../../types';
import NewsFeedPanel from './NewsFeedPanel';

interface NewsDashboardProps {
  projectNews: NewsItem[];
  marketNews: NewsItem[];
}

const NewsDashboard: FC<NewsDashboardProps> = ({ projectNews, marketNews }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <NewsFeedPanel 
        title="My Projects Feed" 
        alerts={projectNews}
        description="Live news & events for companies in your active projects."
        emptyMessage="No project-specific news available."
      />
      <NewsFeedPanel 
        title="Live Market Feed" 
        alerts={marketNews}
        description="The latest updates from all companies in the database."
        emptyMessage="Market news feed is currently unavailable."
      />
    </div>
    
    <div className="text-center text-secondary text-xs">
      <p>💡 News feed updates automatically.</p>
    </div>
  </div>
);

export default NewsDashboard;
