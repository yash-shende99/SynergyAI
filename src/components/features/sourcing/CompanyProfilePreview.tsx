'use client';

import { FC, useState } from 'react';
import { Company, Watchlist } from '../../../types';
import { Button } from '../../ui/button';
import { Star, Loader2, ChevronDown } from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';

interface CompanyProfilePreviewProps {
  company: Company | null;
  watchlists?: Watchlist[];
}

const CompanyProfilePreview: FC<CompanyProfilePreviewProps> = ({ company, watchlists = [] }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [showWatchlistDropdown, setShowWatchlistDropdown] = useState(false);

  if (!company) {
    return (
      <div className="h-full p-6 rounded-xl border border-border bg-surface/50 flex items-center justify-center">
        <p className="text-secondary">Select a company to see details</p>
      </div>
    );
  }

  const addToSpecificWatchlist = async (watchlistId: string, watchlistName: string) => {
    setIsAdding(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { alert('Please log in'); return; }

      const response = await fetch(`http://localhost:8000/api/watchlists/${watchlistId}/companies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ company_cin: company.id })
      });

      if (response.ok) {
        alert(`"${company.name}" has been added to "${watchlistName}"!`);
        setShowWatchlistDropdown(false);
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Failed to add company: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error adding to watchlist:', error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="h-full p-6 rounded-xl border border-border bg-surface/50 flex flex-col relative">
      <div className="flex items-center gap-4 pb-4 border-b border-border">
        <img src={company.logoUrl} alt={`${company.name} logo`} className="h-16 w-16 rounded-lg bg-white p-1"/>
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
            className="w-full flex items-center justify-between"
            disabled={isAdding || watchlists.length === 0}
          >
            <div className="flex items-center">
              {isAdding ? (
                <Loader2 size={16} className="mr-2 animate-spin" />
              ) : (
                <Star size={16} className="mr-2" />
              )}
              Add to Watchlist
            </div>
            <ChevronDown size={16} className={`transition-transform ${showWatchlistDropdown ? 'rotate-180' : ''}`} />
          </Button>

          {/* Watchlist Dropdown Menu */}
          {showWatchlistDropdown && watchlists.length > 0 && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-surface border border-border rounded-lg shadow-lg z-10 overflow-hidden">
              <div className="max-h-48 overflow-y-auto">
                {watchlists.map((watchlist) => (
                  <button
                    key={watchlist.id}
                    onClick={() => addToSpecificWatchlist(watchlist.id, watchlist.name)}
                    disabled={isAdding}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-border transition-colors text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {watchlist.name}
                  </button>
                ))}
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