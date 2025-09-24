'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { SynergyAiScore } from '../../../../../../types';
import { Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from '../../../../../../lib/supabaseClient';
import SynergyScoreSection from '../../../../../../components/features/analytics/synergy/SynergyScoreSection';

export default function SynergyScorePage() {
  const [scoreData, setScoreData] = useState<SynergyAiScore | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const params = useParams();
  const projectId = params.projectId as string;

  useEffect(() => {
    async function fetchScore() {
      if (!projectId) return;
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setIsLoading(false); return; }
      
      try {
        const response = await fetch(`http://localhost:8000/api/projects/${projectId}/synergy_score`, {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        });
        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.detail || "Failed to fetch SynergyAI Score");
        }
        const data = await response.json();
        setScoreData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchScore();
  }, [projectId]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>;
  }

  if (error || !scoreData) {
    return <div className="flex flex-col justify-center items-center h-full text-red-400"><AlertTriangle className="h-8 w-8 mb-2"/><p>{error || "Could not load Synergy Score."}</p></div>;
  }

  return (
    <SynergyScoreSection scoreData={scoreData} />
  );
}