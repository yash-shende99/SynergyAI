'use client';

import { useState } from 'react';
import { ProjectIntelligenceData } from '../../../types';
import NewsFeedPanel from './NewsFeedPanel';
import AiRecommendationsPanel from './AiRecommendationsPanel';

const InsightsDashboard: React.FC<{ data: ProjectIntelligenceData }> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<'project' | 'competitor' | 'ai'>('project');

  return (
    <div className="space-y-6">
      <div className="flex border-b border-border">
        <button onClick={() => setActiveTab('project')} className={`px-4 py-2 text-sm ${activeTab === 'project' ? 'text-primary border-b-2 border-primary' : 'text-secondary'}`}>Project News</button>
        <button onClick={() => setActiveTab('competitor')} className={`px-4 py-2 text-sm ${activeTab === 'competitor' ? 'text-primary border-b-2 border-primary' : 'text-secondary'}`}>Competitor News</button>
        <button onClick={() => setActiveTab('ai')} className={`px-4 py-2 text-sm ${activeTab === 'ai' ? 'text-primary border-b-2 border-primary' : 'text-secondary'}`}>AI Recommendations</button>
      </div>
      <div>
        {activeTab === 'project' && <NewsFeedPanel alerts={data.projectNews} />}
        {activeTab === 'competitor' && <NewsFeedPanel alerts={data.competitorNews} />}
        {activeTab === 'ai' && <AiRecommendationsPanel recommendations={data.aiRecommendations} />}
      </div>
    </div>
  );
};
export default InsightsDashboard;