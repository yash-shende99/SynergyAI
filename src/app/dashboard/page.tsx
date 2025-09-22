'use client';

import { useState, useEffect } from 'react';
import PipelineSection from './pipeline/PipelineSection';
import CreateProjectModal from './pipeline/CreateProjectModal';
import { Project } from '../../types';
import { Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

export default function MissionControlPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchProjects = async () => {
  setIsLoading(true);
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { 
      setIsLoading(false); 
      return; 
    }

    const response = await fetch('http://localhost:8000/api/projects', {
      headers: { 'Authorization': `Bearer ${session.access_token}` }
    });
    
    if (response.status === 401) {
      // Handle unauthorized - possibly redirect to login
      console.error("Unauthorized - please log in again");
      return;
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Failed to fetch projects");
    }
    
    const data = await response.json();
    setProjects(data);
  } catch (error) {
    console.error("Error fetching projects:", error);
    // Don't throw here, just handle gracefully
  } finally {
    setIsLoading(false);
  }
};

  useEffect(() => {
    fetchProjects();
  }, []);
const handleCreateProject = async (projectData: { name: string; companyCin: string; teamEmails: string[] }) => {
  setIsLoading(true);
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
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to create project");
    }
    
    const result = await response.json();
    console.log("Project created successfully:", result);
    
    setIsModalOpen(false);
    await fetchProjects(); // Refresh the project list
    
  } catch (error) {
  console.error("Error creating project:", error);
  alert((error as Error).message || "Failed to create project.");
} finally {
    setIsLoading(false);
  }
};

  if (isLoading && projects.length === 0) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>;
  }


  return (
    <>
      {/*
        The PipelineSection ONLY receives the props it needs: the list of projects
        and a function to tell the parent to open the modal.
      */}
      <PipelineSection 
        projects={projects} 
        onOpenCreateModal={() => setIsModalOpen(true)}
      />
      
      {/*
        The CreateProjectModal ONLY receives the props it needs: state for visibility
        and the functions to close it and create a project.
      */}
      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateProject={handleCreateProject}
      />
    </>
  );
}

