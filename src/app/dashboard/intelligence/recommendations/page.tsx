'use client';

import { useState, useEffect } from 'react';
import { AiRecommendation } from '../../../../types';
import { Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from '../../../../lib/supabaseClient';
import RecommendationsSection from '../../../../components/features/intelligence/recommendations/RecommendationsSection';

export default function AiRecommendationsPage() {
  const [recommendations, setRecommendations] = useState<AiRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchRecommendations() {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setIsLoading(false); return; }
      
      try {
        const response = await fetch('http://localhost:8000/api/ai/recommendations', {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        });
        if (!response.ok) throw new Error("Failed to fetch AI recommendations.");
        
        const data = await response.json();
        const adaptedData = data.map((item: any) => ({
            ...item,
            company: {
                id: item.company.cin,
                name: item.company.name,
                logoUrl: item.company.logo_url,
                sector: item.company.industry?.sector,
                location: item.company.location?.headquarters,
                revenue: item.company.financial_summary?.revenue_cr,
                employees: item.company.financial_summary?.employee_count
            }
        }));
        setRecommendations(adaptedData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchRecommendations();
  }, []);

  if (isLoading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>;
  }

  if (error) {
    return <div className="flex flex-col justify-center items-center h-full text-red-400"><AlertTriangle className="h-8 w-8 mb-2"/><p>{error}</p></div>;
  }

  return (
    <RecommendationsSection recommendations={recommendations} />
  );
}