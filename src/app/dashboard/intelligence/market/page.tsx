'use client';

import { useState, useEffect } from 'react';
import { MarketIntelligenceData } from '../../../../types';
import { Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from '../../../../lib/supabaseClient';
import MarketIntelligenceDashboard from '../../../../components/features/intelligence/market/MarketIntelligenceDashboard';

export default function MarketIntelligencePage() {
  const [marketData, setMarketData] = useState<MarketIntelligenceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchMarketData() {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setIsLoading(false); return; }
      
      try {
        const response = await fetch('http://localhost:8000/api/intelligence/market', {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        });
        if (!response.ok) throw new Error("Failed to fetch market intelligence data.");
        
        const data = await response.json();
        setMarketData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchMarketData();
  }, []);

  if (isLoading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>;
  }

  if (error || !marketData) {
    return <div className="flex flex-col justify-center items-center h-full text-red-400"><AlertTriangle className="h-8 w-8 mb-2"/><p>{error || "An error occurred."}</p></div>;
  }

  return (
    <MarketIntelligenceDashboard data={marketData} />
  );
}
