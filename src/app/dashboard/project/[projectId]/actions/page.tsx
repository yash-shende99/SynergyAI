// app/dashboard/project/[projectId]/actions/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { ProjectTask } from '../../../../../types';
import { Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from '../../../../../lib/supabaseClient';
import NextActionsSection from '../../../../../components/features/project/actions/NextActionsSection';

export default function NextActionsPage() {
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const params = useParams();
  const projectId = params.projectId as string;

  const fetchTasks = useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setIsLoading(false); return; }
    try {
      const response = await fetch(`http://localhost:8000/api/projects/${projectId}/tasks`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      if (!response.ok) throw new Error("Failed to fetch tasks.");
      const data = await response.json();
      setTasks(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>;
  }

  if (error) {
    return <div className="flex flex-col items-center justify-center h-full text-red-400"><AlertTriangle className="h-8 w-8 mb-2"/><p>{error}</p></div>;
  }

  return (
    <NextActionsSection 
      initialTasks={tasks}
      projectId={projectId}
      onTasksChange={fetchTasks}
    />
  );
}