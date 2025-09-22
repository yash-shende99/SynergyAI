'use client';

import { useState, useEffect, useCallback } from 'react';
import { WatchlistWithCount, Company } from '../../../../types';
import MyWatchlistsPanel from '../../../../components/features/sourcing/watchlist/MyWatchlistsPanel';
import AlertsDashboard from '../../../../components/features/sourcing/watchlist/AlertsDashboard';
import { Loader2 } from 'lucide-react';
import { supabase } from '../../../../lib/supabaseClient';

export default function SourcingWatchlistsPage() {
  const [watchlists, setWatchlists] = useState<WatchlistWithCount[]>([]);
  const [selectedWatchlist, setSelectedWatchlist] = useState<WatchlistWithCount | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoadingWatchlists, setIsLoadingWatchlists] = useState(true);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);

  const fetchWatchlists = useCallback(async () => {
    setIsLoadingWatchlists(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setIsLoadingWatchlists(false); return; }

    try {
      const response = await fetch('http://localhost:8000/api/watchlists_with_counts', {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      if (!response.ok) throw new Error("Failed to fetch watchlists");
      const data = await response.json();
      setWatchlists(data);

      if (data.length > 0) {
        // If a watchlist is already selected, try to find it in the new list to keep it selected.
        // Otherwise, default to the first one.
        setSelectedWatchlist(prev => data.find((w: WatchlistWithCount) => w.id === prev?.id) || data[0]);
      } else {
        setSelectedWatchlist(null);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingWatchlists(false);
    }
  }, []); // Removed dependency to avoid re-fetching issues

  useEffect(() => {
    fetchWatchlists();
  }, []);

  const fetchCompanies = useCallback(async () => {
    if (!selectedWatchlist) {
      setCompanies([]);
      return;
    }
    
    setIsLoadingCompanies(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setIsLoadingCompanies(false); return; }
    
    try {
      const response = await fetch(`http://localhost:8000/api/watchlists/${selectedWatchlist.id}/companies`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      if (!response.ok) throw new Error("Failed to fetch companies");
      const data = await response.json();
      const adaptedData = data.map((item: any) => ({
          id: item.cin, name: item.name, logoUrl: item.logo_url,
          sector: item.industry?.sector || 'N/A', location: item.location?.headquarters || 'N/A',
          revenue: item.financial_summary?.revenue_cr || 0, employees: item.financial_summary?.employee_count || 0,
      }));
      setCompanies(adaptedData);
    } catch (error) {
      console.error(error);
      setCompanies([]);
    } finally {
      setIsLoadingCompanies(false);
    }
  }, [selectedWatchlist]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  if (isLoadingWatchlists) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
      <div className="lg:col-span-1">
        <MyWatchlistsPanel 
          watchlists={watchlists}
          selectedWatchlist={selectedWatchlist}
          setSelectedWatchlist={setSelectedWatchlist}
          onWatchlistChange={fetchWatchlists}
        />
      </div>
      <div className="lg:col-span-3">
        <AlertsDashboard 
          watchlist={selectedWatchlist}
          companies={companies}
          isLoading={isLoadingCompanies}
          onCompanyChange={fetchCompanies}
        />
      </div>
    </div>
  );
}