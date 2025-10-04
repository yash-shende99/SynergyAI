// components/features/insights/ProjectNews/ProjectNewsPanel.tsx
import { FC } from 'react';
import { NewsItem } from '../../../../types';
import NewsItemCard from '../../intelligence/NewsItemCard';
import { Newspaper } from 'lucide-react';

interface ProjectNewsPanelProps {
  news: NewsItem[];
}

const ProjectNewsPanel: FC<ProjectNewsPanelProps> = ({ news }) => (
  <div className="space-y-6">
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-white mb-2">Project News</h1>
      <p className="text-secondary">Latest news and updates about this project</p>
    </div>
    
    {news.length > 0 ? (
      <div className="space-y-4">
        {news.map(alert => (
          <NewsItemCard key={alert.id} alert={alert} />
        ))}
      </div>
    ) : (
      <div className="text-center text-secondary py-16">
        <Newspaper size={48} className="mx-auto mb-4 opacity-30"/>
        <p className="font-semibold">No project news found.</p>
        <p className="text-sm mt-1">News about this project will appear here.</p>
      </div>
    )}
  </div>
);

export default ProjectNewsPanel;