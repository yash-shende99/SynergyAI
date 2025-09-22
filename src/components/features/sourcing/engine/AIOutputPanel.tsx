import { FC } from 'react';
import { StrategicSearchResult } from '../../../../types';
import {Button} from '../../../ui/button';
import { Star, Loader2, AlertTriangle } from 'lucide-react';

interface AIOutputPanelProps {
  results: StrategicSearchResult[];
  isLoading: boolean;
  statusMessage: string;
  error: string;
}

const AIOutputPanel: FC<AIOutputPanelProps> = ({ results, isLoading, statusMessage, error }) => {
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center text-secondary p-4">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary"/>
          <p>{statusMessage || 'Initializing AI analysis...'}</p>
        </div>
      );
    }
    if (error) {
      return <div className="flex flex-col justify-center items-center h-48 text-red-400"><AlertTriangle className="h-8 w-8 mb-2"/><p>{error}</p></div>;
    }
    if (results.length === 0) {
      return <div className="flex justify-center items-center h-48 text-secondary"><p>Enter a query above and click "Generate" to see AI-ranked results.</p></div>;
    }
    return (
      <div className="space-y-4">
        {results.map(result => (
          <div key={result.company.id} className="flex items-center gap-4 p-4 rounded-lg bg-background/50 border border-border">
            <img 
              src={result.company.logoUrl} 
              alt={`${result.company.name} logo`} 
              className="h-10 w-10 rounded-md bg-white p-1"
              onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/40x40/111111/FFFFFF?text=N/A'; }}
            />
            <div className="flex-1">
              <h4 className="font-bold text-white">{result.company.name}</h4>
              <p className="text-xs text-secondary mt-1">AI Rationale: <span className="text-slate-300">{result.rationale}</span></p>
            </div>
            <div className="text-center">
              <p className="text-xs text-secondary">Fit Score</p>
              <p className="text-2xl font-bold text-green-400">{result.fitScore}</p>
            </div>
            <Button variant="secondary" size="sm"><Star size={16} className="mr-2"/>Add to Watchlist</Button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 rounded-xl border border-border bg-surface/50">
      <h3 className="font-bold text-white mb-4">AI Recommendations</h3>
      {renderContent()}
    </div>
  );
};

export default AIOutputPanel;
