'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Project } from '../../../../../types';
import { Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from '../../../../../lib/supabaseClient';
import GeneralSettingsSection from '../../../../../components/features/project-settings/general/GeneralSettingsSection';

export default function GeneralSettingsPage() {
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const params = useParams();
  const projectId = params.projectId as string;

  const fetchProject = useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setIsLoading(false); return; }
    try {
      const response = await fetch(`http://localhost:8000/api/projects/${projectId}`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      if (!response.ok) throw new Error("Failed to fetch project details.");
      const data = await response.json();
      setProject(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>;
  }
  
  if (error || !project) {
    return <div className="flex flex-col items-center justify-center h-full text-red-400"><AlertTriangle className="h-8 w-8 mb-2"/><p>{error || "Could not load project settings."}</p></div>;
  }

  return (
    <GeneralSettingsSection 
      project={project}
      onUpdate={fetchProject} // Refetch the data after an update to confirm changes
    />
  );
}
