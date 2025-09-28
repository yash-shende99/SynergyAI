import { FC } from 'react';
import { ProjectInsight } from '../../../types';
import { Lightbulb, Zap, ArrowRight } from 'lucide-react';

const AiRecommendationsPanel: FC<{ recommendations: ProjectInsight[] }> = ({ recommendations }) => (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-2">
        <Lightbulb className="h-6 w-6 text-primary"/>
        <div>
          <h3 className="text-lg font-bold text-white">AI-Generated Strategic Recommendations</h3>
          <p className="text-sm text-secondary">Proactive insights based on the latest news for this project.</p>
        </div>
      </div>
      {recommendations.map((rec, index) => (
        <div key={index} className="p-4 rounded-lg bg-surface/50 border border-border">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm mb-2">
            <Zap size={16}/>
            <span>{rec.headline}</span>
          </div>
          <p className="text-sm text-secondary mb-3">{rec.rationale}</p>
          <button className="flex items-center gap-2 text-xs text-primary font-semibold hover:underline">
            <span>{rec.recommendation}</span>
            <ArrowRight size={14}/>
          </button>
        </div>
      ))}
    </div>
);

export default AiRecommendationsPanel;