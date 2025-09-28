'use client';

import { FC, useState } from 'react';
import { AiRecommendation } from '../../../../types';
import RecommendationCard from './RecommendationCard';
import { Lightbulb, Filter } from 'lucide-react';

const RecommendationsSection: FC<{ recommendations: AiRecommendation[] }> = ({ recommendations: initialRecs }) => {
  const [recommendations, setRecommendations] = useState(initialRecs);

  const handleDismiss = (companyId: string) => {
    setRecommendations(prev => prev.filter(rec => rec.company.id !== companyId));
  };

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl border border-border bg-surface/50 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Lightbulb className="h-6 w-6 text-primary"/>
          <div>
            <h2 className="text-xl font-bold text-white">AI-Generated Recommendations</h2>
            <p className="text-sm text-secondary">Proactive deal sourcing based on market triggers and your strategic profile.</p>
          </div>
        </div>
        <button className="flex items-center gap-2 text-sm text-secondary hover:text-white p-2 rounded-md bg-surface hover:bg-border"><Filter size={16}/>Filter</button>
      </div>
      
      {recommendations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map(rec => (
            <RecommendationCard 
              key={rec.company.id} 
              recommendation={rec} 
              onDismiss={() => handleDismiss(rec.company.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-secondary">
          <p className="font-semibold">No new AI recommendations at this time.</p>
          <p className="text-sm mt-1">The AI scout is continuously monitoring the market for new opportunities.</p>
        </div>
      )}
    </div>
  );
};

export default RecommendationsSection;