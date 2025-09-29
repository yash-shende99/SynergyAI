
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Role } from '../../../../../../types';
import { Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from '../../../../../../lib/supabaseClient';
import RolesManagementSection from '../../../../../../components/features/team/roles/RolesManagementSection';

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const params = useParams();
  const projectId = params.projectId as string;

  useEffect(() => {
    async function fetchRoles() {
      if (!projectId) return;
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setIsLoading(false); return; }
      
      try {
        const response = await fetch(`http://localhost:8000/api/projects/${projectId}/roles`, {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        });
        if (!response.ok) throw new Error("Failed to fetch roles.");
        const data = await response.json();
        setRoles(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchRoles();
  }, [projectId]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>;
  }

  if (error || !roles) {
    return <div className="flex flex-col justify-center items-center h-full text-red-400"><AlertTriangle className="h-8 w-8 mb-2"/><p>{error || "Could not load roles."}</p></div>;
  }

  return (
    <RolesManagementSection roles={roles} />
  );
}
