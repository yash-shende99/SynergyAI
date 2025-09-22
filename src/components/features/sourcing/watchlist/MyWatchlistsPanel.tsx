import { FC } from 'react';
import { Plus } from 'lucide-react';
import { WatchlistWithCount } from '../../../../types';
import { supabase } from '../../../../lib/supabaseClient';

interface MyWatchlistsPanelProps {
  watchlists: WatchlistWithCount[];
  selectedWatchlist: WatchlistWithCount | null;
  setSelectedWatchlist: (watchlist: WatchlistWithCount) => void;
  onWatchlistChange: () => void;
}

const MyWatchlistsPanel: FC<MyWatchlistsPanelProps> = ({ watchlists, selectedWatchlist, setSelectedWatchlist, onWatchlistChange }) => {
  const handleCreate = async () => {
    const name = prompt("Enter a name for your new watchlist:");
    if (!name?.trim()) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { alert('Please log in'); return; }
      const response = await fetch('http://localhost:8000/api/watchlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify({ name: name.trim() })
      });
      if (!response.ok) throw new Error('Failed to create watchlist');
      onWatchlistChange(); // This tells the parent page to refresh the list of watchlists
    } catch (error) {
      console.error(error);
      alert('Failed to create watchlist');
    }
  };

  return (
    <div className="p-4 rounded-xl border border-border bg-surface/50 h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-white">My Watchlists</h3>
        <button onClick={handleCreate} className="text-secondary hover:text-primary"><Plus size={20} /></button>
      </div>
      <div className="space-y-1">
        {watchlists.map(list => (
          <button key={list.id} onClick={() => setSelectedWatchlist(list)}
            className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${selectedWatchlist?.id === list.id ? 'bg-primary/20 text-primary font-semibold' : 'text-secondary hover:bg-surface'}`}>
            <div className="flex justify-between items-center">
              <span>{list.name}</span>
              <span className="text-xs bg-primary/20 px-2 py-1 rounded">{list.company_count}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
export default MyWatchlistsPanel;