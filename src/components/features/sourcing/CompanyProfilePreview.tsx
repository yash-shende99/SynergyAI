'use client';

import { FC, useState } from 'react';
import { Company, Watchlist } from '../../../types';
import { Button } from '../../ui/button';
import { Star, Loader2, ChevronDown } from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';
import { handleLogoError } from '../../../lib/utils';
import { useWatchlistStore } from '../../../store/watchlistStore';

interface CompanyProfilePreviewProps {
  company: Company | null;
  watchlists?: Watchlist[];
}

const CompanyProfilePreview: FC<CompanyProfilePreviewProps> = ({ company, watchlists = [] }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [showWatchlistDropdown, setShowWatchlistDropdown] = useState(false);
  const { watchlists: storeWatchlists, isCompanyInWatchlist, isCompanyInSpecificWatchlist, addToWatchlist } = useWatchlistStore();

  const isAdded = company ? isCompanyInWatchlist(company.id) : false;

  if (!company) {
    return (
      <div className="h-full p-6 rounded-xl border border-border bg-surface/50 flex items-center justify-center">
        <p className="text-secondary">Select a company to see details</p>
      </div>
    );
  }

  const addToSpecificWatchlist = async (watchlistId: string, watchlistName: string) => {
    if (!company) return;
    setIsAdding(true);
    try {
      await addToWatchlist(company, watchlistId);
      setShowWatchlistDropdown(false);
    } catch (error) {
      console.error('Error adding to watchlist:', error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="h-full p-6 rounded-xl border border-border bg-surface/50 flex flex-col relative">
      <div className="flex items-center gap-4 pb-4 border-b border-border">
        <img 
          src={company.logoUrl || '/placeholder-logo.svg'} 
          alt={`${company.name} logo`} 
          className="h-16 w-16 rounded-lg bg-white p-1"
          onError={handleLogoError}
        />
        <div>
          <h3 className="text-xl font-bold text-white">{company.name}</h3>
          <p className="text-secondary">{company.location}</p>
        </div>
      </div>
      
      <div className="py-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-secondary">Sector:</span> 
          <span className="font-medium text-white">{company.sector}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-secondary">Revenue (FY24):</span> 
          <span className="font-medium text-white">₹{company.revenue} Cr</span>
        </div>
        <div className="flex justify-between">
          <span className="text-secondary">Employees:</span> 
          <span className="font-medium text-white">{company.employees.toLocaleString('en-IN')}</span>
        </div>
      </div>
      
      <div className="mt-auto pt-4 border-t border-border flex flex-col items-center gap-2">
        {/* Watchlist Dropdown Button */}
        <div className="relative w-full">
          <Button 
            onClick={() => setShowWatchlistDropdown(!showWatchlistDropdown)}
            variant="secondary" 
            size="sm" 
            className={`w-full flex items-center justify-between ${isAdded ? 'bg-primary/20 text-primary hover:bg-primary/30 border border-primary/30' : ''}`}
            disabled={isAdding || storeWatchlists.length === 0}
          >
            <div className="flex items-center">
              {isAdding ? (
                <Loader2 size={16} className="mr-2 animate-spin" />
              ) : (
                <Star size={16} className={`mr-2 ${isAdded ? 'fill-primary' : ''}`} />
              )}
              {isAdding ? 'Adding...' : isAdded ? 'In Watchlist' : 'Add to Watchlist'}
            </div>
            <ChevronDown size={14} className={`ml-2 text-secondary opacity-50 transition-transform ${showWatchlistDropdown ? 'rotate-180' : ''}`} />
          </Button>

          {/* Watchlist Dropdown Menu */}
          {showWatchlistDropdown && storeWatchlists.length > 0 && (
            <div className="absolute bottom-full left-0 w-full mb-2 bg-background border border-border rounded-lg shadow-lg overflow-hidden z-10">
              <div className="p-2 border-b border-border/50 bg-surface/50 text-xs text-secondary font-semibold">
                Select Watchlist
              </div>
              <div className="max-h-48 overflow-y-auto">
                {storeWatchlists.map(wl => {
                  const inThis = company ? isCompanyInSpecificWatchlist(company.id, wl.id) : false;
                  return (
                    <button
                      key={wl.id}
                      onClick={() => !inThis && addToSpecificWatchlist(wl.id, wl.name)}
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

        {watchlists.length === 0 && (
          <p className="text-xs text-secondary text-center">
            No watchlists available. Create one first.
          </p>
        )}
      </div>
    </div>
  );
};

export default CompanyProfilePreview;