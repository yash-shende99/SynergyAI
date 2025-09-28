'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import QASection from '../../../../../../components/features/vdr/qa/QASection';
import { VdrSource, VdrConversation } from '../../../../../../types';
import { supabase } from '../../../../../../lib/supabaseClient';
import { Loader2 } from 'lucide-react';

export default function VDRQAPage() {
  const [conversation, setConversation] = useState<VdrConversation | null>(null);
  const [activeSource, setActiveSource] = useState<VdrSource | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams();
  const projectId = params.projectId as string;

  useEffect(() => {

    async function fetchHistory() {
      if (!projectId) return;
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setIsLoading(false); return; }
      try {
        const response = await fetch(`http://localhost:8000/api/projects/${projectId}/vdr/chat`, {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        });
        if (!response.ok) throw new Error("Failed to fetch chat history");
        const data = await response.json();
        data.messages = typeof data.messages === 'string' ? JSON.parse(data.messages) : data.messages || [];
        setConversation(data);
      } catch (error) {
        console.error(error);
        setConversation({ id: null, messages: [] });
      } finally {
        setIsLoading(false);
      }
    }
    fetchHistory();
  }, [projectId]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>;
  }

  return (
    <QASection 
      projectId={projectId}
      conversation={conversation}
      setConversation={setConversation}
      activeSource={activeSource}
      setActiveSource={setActiveSource}
    />
  );
}