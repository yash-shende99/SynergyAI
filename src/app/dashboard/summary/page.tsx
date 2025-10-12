'use client';

import { useState, useEffect } from 'react';
import AISummarySection from './AISummarySection';
import { AISummary } from '../../../types';
import { Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';

export default function SummaryPage() {
  const [chartData, setChartData] = useState<AISummary['distribution'] | null>(null);
  const [narrative, setNarrative] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNarrativeLoading, setIsNarrativeLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchSummaryData() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setIsLoading(false); return; }
      
      try {
        // --- STEP 1: Fast fetch for chart data ---
        const chartResponse = await fetch('http://localhost:8000/api/dashboard/chart_data', {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        });
        if (!chartResponse.ok) throw new Error('Failed to fetch chart data.');
        const charts = await chartResponse.json();
        setChartData(charts);
        setIsLoading(false); // <-- The main loader disappears almost instantly!

        // --- STEP 2: Slow fetch for AI narrative ---
        const narrativeResponse = await fetch('http://localhost:8000/api/dashboard/narrative', {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        });
        if (!narrativeResponse.ok) throw new Error('Failed to fetch AI summary.');
        const narrativeData = await narrativeResponse.json();
        setNarrative(narrativeData.narrative);
        setIsNarrativeLoading(false);

      } catch (err: any) {
        setError(err.message);
        setIsLoading(false);
        setIsNarrativeLoading(false);
      }
    }
    fetchSummaryData();
  }, []);

  if (isLoading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>;
  }

  if (error || !chartData) {
    return <div className="flex flex-col justify-center items-center h-full text-red-400"><AlertTriangle className="h-8 w-8 mb-2"/><p>{error || 'An error occurred.'}</p></div>;
  }

  return (
    <AISummarySection 
      chartData={chartData} 
      narrative={narrative}
      isNarrativeLoading={isNarrativeLoading}
    />
  );
}