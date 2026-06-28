import { FC } from 'react';
import { AiRecommendation } from '../../../../types';
import {Button} from '../../../ui/button';
import { Star, X, Zap, Loader2, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useWatchlistStore } from '../../../../store/watchlistStore';
import { useState } from 'react';

interface RecommendationCardProps {
  recommendation: AiRecommendation;
  onDismiss: () => void;
}

const RecommendationCard: FC<RecommendationCardProps> = ({ recommendation, onDismiss }) => {
  const { company, triggerEvent, aiThesis } = recommendation;
  const { watchlists, addToWatchlist, initializeWatchlists, isCompanyInWatchlist, isCompanyInSpecificWatchlist } = useWatchlistStore();
  const [isAdding, setIsAdding] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const isAdded = isCompanyInWatchlist(company.id);

  // Initialize watchlists if they aren't loaded yet
  if (watchlists.length === 0) {
    initializeWatchlists();
  }

  const handleAddToSpecificWatchlist = async (watchlistId: string) => {
    setIsAdding(true);
    await addToWatchlist(company, watchlistId);
    setIsAdding(false);
    setShowDropdown(false);
  };

  return (
    <div className="rounded-2xl border border-border bg-surface/50 p-6 flex flex-col h-full transition-all duration-300 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10">
      <div className="flex items-start gap-4">
        <img 
          src={company.logoUrl || '/placeholder-logo.svg'} 
          alt={`${company.name} logo`} 
          className="h-12 w-12 rounded-lg bg-white p-1"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder-logo.svg';
          }}
        />
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
        <div className="relative flex-1">
          <Button 
            variant="secondary" 
            size="sm" 
            className={`w-full flex items-center justify-between ${isAdded ? 'bg-primary/20 text-primary hover:bg-primary/30 border border-primary/30' : ''}`}
            onClick={() => setShowDropdown(!showDropdown)}
            disabled={isAdding || watchlists.length === 0}
          >
            <div className="flex items-center">
              {isAdding ? (
                <Loader2 size={16} className="mr-2 animate-spin"/>
              ) : (
                <Star size={16} className={`mr-2 ${isAdded ? 'fill-primary' : ''}`}/>
              )}
              {isAdding ? 'Adding...' : isAdded ? 'In Watchlist' : 'Add to Watchlist'}
            </div>
            <ChevronDown size={14} className={`ml-2 text-secondary opacity-50 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
          </Button>

          {showDropdown && watchlists.length > 0 && (
            <div className="absolute bottom-full left-0 w-full mb-2 bg-background border border-border rounded-lg shadow-lg overflow-hidden z-10">
              <div className="p-2 border-b border-border/50 bg-surface/50 text-xs text-secondary font-semibold">
                Select Watchlist
              </div>
              <div className="max-h-48 overflow-y-auto">
                {watchlists.map(wl => {
                  const inThis = isCompanyInSpecificWatchlist(company.id, wl.id);
                  return (
                    <button
                      key={wl.id}
                      onClick={() => !inThis && handleAddToSpecificWatchlist(wl.id)}
                      disabled={inThis}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center justify-between ${
                        inThis ? 'text-primary/70 bg-primary/10 cursor-not-allowed' : 'text-secondary hover:text-white hover:bg-surface'
                      }`}
                    >
                      <span>{wl.name}</span>
                      {inThis && <Star size={12} className="fill-primary text-primary" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        <Button onClick={onDismiss} variant="ghost" size="sm" className="text-secondary hover:bg-surface"><X size={16}/></Button>
      </div>
    </div>
  );
};

export default RecommendationCard;