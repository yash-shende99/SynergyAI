// app/dashboard/intelligence/market/page.tsx - WITH WORKING CACHE
'use client';
import MarketIntelligenceDashboard from '../../../../components/features/intelligence/market/MarketIntelligenceDashboard';
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { supabase } from '../../../../lib/supabaseClient';
import { useEnhancedCache } from '../../../../hooks/useEnhancedCache';

// Fetch function
const fetchMarketData = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('No session');

  const response = await fetch('http://localhost:8000/api/intelligence/market', {
    headers: { 'Authorization': `Bearer ${session.access_token}` }
  });

  if (!response.ok) throw new Error("Failed to fetch market data");
  return response.json();
};

export default function MarketIntelligencePage() {
  const {
    data: marketData,
    loading,
    error,
    refetch,
    invalidate
  } = useEnhancedCache('market-intelligence', fetchMarketData, {
    ttl: 300000, 
    onError: (err) => console.error('Market data error:', err)
  });
  if (loading && !marketData) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading market data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-64 text-red-400">
        <AlertTriangle className="h-8 w-8 mb-2" />
        <p>{error}</p>
        <button
          onClick={() => refetch()}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center"
        >
          <RefreshCw size={16} className="mr-2" />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Market Intelligence</h1>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-surface hover:bg-border text-white rounded-xl transition-colors"
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>
      <MarketIntelligenceDashboard data={marketData} />
    </div>
  );
}