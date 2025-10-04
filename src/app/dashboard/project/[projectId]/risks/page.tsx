'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { KeyRisk } from '../../../../../types';
import { Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from '../../../../../lib/supabaseClient';
import KeyRisksSection from '../../../../../components/features/project/risks/KeyRisksSection';

export default function KeyRisksPage() {
  const [risks, setRisks] = useState<KeyRisk[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const params = useParams();
  const projectId = params.projectId as string;

  useEffect(() => {
    async function fetchRisks() {
      if (!projectId) return;
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setIsLoading(false); return; }
      
      try {
        const response = await fetch(`http://localhost:8000/api/projects/${projectId}/key_risks`, {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail || "Failed to fetch key risks");
        }
        const data = await response.json();
        setRisks(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchRisks();
  }, [projectId]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>;
  }

  if (error) {
    return <div className="flex flex-col justify-center items-center h-full text-red-400"><AlertTriangle className="h-8 w-8 mb-2"/><p>{error}</p></div>;
  }

  return (
    <KeyRisksSection risks={risks} />
  );
}
