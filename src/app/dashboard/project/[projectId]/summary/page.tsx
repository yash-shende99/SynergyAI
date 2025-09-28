'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ProjectSummary } from '../../../../../types';
import { Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from '../../../../../lib/supabaseClient';
import ProjectSummaryDashboard from '../../../../../components/features/project/summary/ProjectSummaryDashboard';

export default function ProjectSummaryPage() {
  const [summaryData, setSummaryData] = useState<ProjectSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const params = useParams();
  const projectId = params.projectId as string;

  useEffect(() => {
    async function fetchSummary() {
      if (!projectId) return;
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setIsLoading(false); return; }
      
      try {
        const response = await fetch(`http://localhost:8000/api/projects/${projectId}/ai_summary`, {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail || "Failed to fetch AI summary");
        }
        const data = await response.json();
        setSummaryData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSummary();
  }, [projectId]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>;
  }

  if (error || !summaryData) {
    return <div className="flex flex-col justify-center items-center h-full text-red-400"><AlertTriangle className="h-8 w-8 mb-2"/><p>{error || "Could not load AI summary."}</p></div>;
  }

  return (
    <ProjectSummaryDashboard data={summaryData} />
  );
}
