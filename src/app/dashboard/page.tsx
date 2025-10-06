// app/dashboard/page.tsx - COMPLETE CLEAN VERSION
'use client';
import { useState } from 'react';
import PipelineSection from './pipeline/PipelineSection';
import CreateProjectModal from './pipeline/CreateProjectModal';
import { Project } from '../../types';
import { Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useSimpleCache } from '../../hooks/useSimpleCache';

// Move fetch function OUTSIDE the component to avoid redeclaration
const fetchProjectsData = async (): Promise<Project[]> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('No session');

  const response = await fetch('http://localhost:8000/api/projects', {
    headers: { 'Authorization': `Bearer ${session.access_token}` }
  });
  
  if (!response.ok) throw new Error('Failed to fetch projects');
  return response.json();
};

export default function DashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Use the cache hook - this replaces ALL your useState and useEffect
  const { data: projectsData, loading, error, refetch } = useSimpleCache('projects', fetchProjectsData);

  const handleCreateProject = async (projectData: { name: string; companyCin: string; teamEmails: string[] }) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { alert("Please log in"); return; }

    try {
      const response = await fetch('http://localhost:8000/api/projects', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}` 
        },
        body: JSON.stringify({
          name: projectData.name,
          company_cin: projectData.companyCin,
          team_emails: projectData.teamEmails
        })
      });
      
      if (!response.ok) throw new Error("Failed to create project");
      
      await refetch(); // Refresh the cache
      setIsModalOpen(false);
    } catch (err) {
      alert((err as Error).message);
    }
  };

  if (loading && !projectsData?.length) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary"/>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-full text-red-400">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Failed to load projects</h2>
          <p className="text-secondary">{error}</p>
          <button 
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <PipelineSection 
        projects={projectsData || []} 
        onOpenCreateModal={() => setIsModalOpen(true)}
      />
      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateProject={handleCreateProject}
      />
    </>
  );
}