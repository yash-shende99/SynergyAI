import { create } from 'zustand';
import { Company, Watchlist } from '../types';
import { supabase } from '../lib/supabaseClient';

interface WatchlistStore {
  watchlists: Watchlist[]; // Changed from watchlist to watchlists (plural)
  isLoading: boolean;
  initializeWatchlists: () => Promise<void>;
  addToWatchlist: (company: Company, watchlistId: string) => Promise<void>;
  removeFromWatchlist: (companyId: string, watchlistId: string) => Promise<void>;
}

export const useWatchlistStore = create<WatchlistStore>((set, get) => ({
  watchlists: [],
  isLoading: true,

  // Fetch all user watchlists
  initializeWatchlists: async () => {
    set({ isLoading: true });
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      set({ watchlists: [], isLoading: false });
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/watchlists', {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', errorText);
        throw new Error(`Failed to fetch watchlists: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      set({ watchlists: data, isLoading: false });
    } catch (error) {
      console.error('Watchlists fetch error:', error);
      set({ isLoading: false });
    }
  },

  // Add a company to a specific watchlist
  addToWatchlist: async (company, watchlistId) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert('Please log in to add to watchlist');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/watchlists/${watchlistId}/companies`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}` 
        },
        body: JSON.stringify({ company_cin: company.id })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to add to watchlist: ${response.status}`);
      }
      
      alert(`"${company.name}" has been added to your watchlist!`);
      
      // Refresh the watchlists to get updated counts
      get().initializeWatchlists();
    } catch (error) {
      console.error("Failed to add to watchlist:", error);
      alert(error instanceof Error ? error.message : "Failed to add to watchlist");
    }
  },

  // Remove a company from a specific watchlist
  removeFromWatchlist: async (companyId, watchlistId) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert('Please log in to remove from watchlist');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/watchlists/${watchlistId}/companies/${companyId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to remove from watchlist: ${response.status}`);
      }
      
      // Refresh the watchlists to get updated counts
      get().initializeWatchlists();
    } catch (error) {
      console.error("Failed to remove from watchlist:", error);
      alert(error instanceof Error ? error.message : "Failed to remove from watchlist");
    }
  },
}));