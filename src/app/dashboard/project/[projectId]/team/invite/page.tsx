// app/dashboard/project/[projectId]/team/invite/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Invitation } from '../../../../../../types';
import { Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from '../../../../../../lib/supabaseClient';
import InvitationsSection from '../../../../../../components/features/team/invitations/InvitationsSection';

export default function InvitationsPage() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const params = useParams();
  const projectId = params.projectId as string;

  const fetchInvitations = useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setIsLoading(false); return; }
    
    try {
      const response = await fetch(`http://localhost:8000/api/projects/${projectId}/invitations`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      if (!response.ok) throw new Error("Failed to fetch invitations.");
      const data = await response.json();
      setInvitations(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>;
  }

  if (error) {
    return <div className="flex flex-col justify-center items-center h-full text-red-400"><AlertTriangle className="h-8 w-8 mb-2"/><p>{error}</p></div>;
  }

  return (
    <InvitationsSection 
      invitations={invitations}
      onInvitationChange={fetchInvitations} // Pass the refresh function
    />
  );
}