// app/dashboard/project/[projectId]/insights/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ProjectIntelligenceData } from '../../../../../types';
import { Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from '../../../../../lib/supabaseClient';
import ProjectNewsPanel from '../../../../../components/features/insights/projectnews/ProjectNewsPanel';

export default function ProjectNewsPage() {
  const [intelData, setIntelData] = useState<ProjectIntelligenceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const params = useParams();
  const projectId = params.projectId as string;

  useEffect(() => {
    async function fetchIntel() {
      if (!projectId) return;
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setIsLoading(false); return; }
      
      try {
        const response = await fetch(`http://localhost:8000/api/projects/${projectId}/intelligence`, {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        });
        if (!response.ok) throw new Error("Failed to fetch project intelligence.");
        const data = await response.json();
        setIntelData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchIntel();
  }, [projectId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary"/>
      </div>
    );
  }

  if (error || !intelData) {
    return (
      <div className="flex flex-col justify-center items-center h-64 text-red-400">
        <AlertTriangle className="h-8 w-8 mb-2"/>
        <p>{error || "Could not load intelligence data."}</p>
      </div>
    );
  }

  return <ProjectNewsPanel news={intelData.projectNews} />;
}