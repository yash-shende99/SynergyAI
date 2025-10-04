// app/dashboard/project/[projectId]/settings/danger/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Project } from '../../../../../../types';
import { Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from '../../../../../../lib/supabaseClient';
import DangerZoneSection from '../../../../../../components/features/project-settings/danger/DangerZoneSection';

export default function DangerZonePage() {
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  useEffect(() => {
    // Fetch project details for the confirmation dialogs
    async function fetchProjectDetails() {
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
    }
    fetchProjectDetails();
  }, [projectId]);

  const handleArchive = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !project) return;
    try {
      const response = await fetch(`http://localhost:8000/api/projects/${project.id}/archive`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail);
      }
      alert("Project archived successfully.");
      router.push('/dashboard');
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };
  
  const handleDelete = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !project) return;
    try {
      const response = await fetch(`http://localhost:8000/api/projects/${project.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify({ projectName: project.name })
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail);
      }
      alert("Project deleted permanently.");
      router.push('/dashboard');
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  if (isLoading || !project) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>;
  }
  
  if (error) {
     return <div className="text-red-400"><AlertTriangle /> {error}</div>;
  }

  return (
    <DangerZoneSection 
      project={project}
      onArchive={handleArchive}
      onDelete={handleDelete}
    />
  );
}