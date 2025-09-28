import { FC } from 'react';
import { AiRecommendation } from '../../../../types';
import {Button} from '../../../ui/button';
import { Star, X, Zap } from 'lucide-react';
import Link from 'next/link';

interface RecommendationCardProps {
  recommendation: AiRecommendation;
  onDismiss: () => void;
}

const RecommendationCard: FC<RecommendationCardProps> = ({ recommendation, onDismiss }) => {
  const { company, triggerEvent, aiThesis } = recommendation;

  return (
    <div className="rounded-2xl border border-border bg-surface/50 p-6 flex flex-col h-full transition-all duration-300 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10">
      <div className="flex items-start gap-4">
        <img src={company.logoUrl} alt={`${company.name} logo`} className="h-12 w-12 rounded-lg bg-white p-1"/>
        <div>
          <h3 className="text-lg font-bold text-white">{company.name}</h3>
          <p className="text-sm text-secondary -mt-1">{company.sector}</p>
        </div>
      </div>
      
      <div className="my-4 p-3 rounded-lg bg-background/50 border border-amber-500/30">
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
          <Zap size={14}/>
          <span>Trigger Event: {triggerEvent.type}</span>
        </div>
        <p className="text-xs text-secondary">{triggerEvent.summary}</p>
      </div>

      <div className="flex-1">
        <h4 className="text-sm font-semibold text-white">AI Investment Thesis</h4>
        <p className="text-sm font-bold text-primary mt-1">"{aiThesis.headline}"</p>
        <p className="text-xs text-secondary mt-2">{aiThesis.rationale}</p>
      </div>

      <div className="mt-4 pt-4 border-t border-border/50 flex items-center gap-2">
        <Button variant="secondary" size="sm" className="flex-1"><Star size={16} className="mr-2"/>Add to Watchlist</Button>
        <Button onClick={onDismiss} variant="ghost" size="sm" className="text-secondary hover:bg-surface"><X size={16}/></Button>
      </div>
    </div>
  );
};

export default RecommendationCard;