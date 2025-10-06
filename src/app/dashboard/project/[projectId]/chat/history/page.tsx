// app/dashboard/project/[projectId]/chat/history/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ProjectAiChat } from '../../../../../../types';
import { Loader2 } from 'lucide-react';
import { supabase } from '../../../../../../lib/supabaseClient';
import ConversationList from '../../../../../../components/features/project-chat/history/ConversationList';
import { Button } from '@/components/ui/button';

export default function ProjectChatHistoryPage() {
  const [conversations, setConversations] = useState<ProjectAiChat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const projectId = params.projectId as string;

  useEffect(() => {
    async function fetchHistory() {
      if (!projectId) {
        setError('No project ID found');
        setIsLoading(false);
        return;
      }
      
      console.log('Fetching conversations for project:', projectId);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('No session found');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:8000/api/projects/${projectId}/ai_chats`, {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        });

        console.log('Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Fetched conversations:', data);
        
        setConversations(data);
      } catch (error) {
        console.error('Error fetching chat history:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');
        setConversations([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchHistory();
  }, [projectId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-white">Loading conversations...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12 border-2 border-dashed border-red-500 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-2">Error Loading Conversations</h3>
          <p className="text-secondary mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  console.log('Rendering with conversations:', conversations);
  
  return <ConversationList conversations={conversations} projectId={projectId} />;
}