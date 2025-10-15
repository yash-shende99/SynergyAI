// app/dashboard/project/[projectId]/chat/[[...chatId]]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ProjectAiChat } from '../../../../../../types';
import { Loader2 } from 'lucide-react';
import { supabase } from '../../../../../../lib/supabaseClient';
import ProjectChatPanel from '../../../../../../components/features/project-chat/ProjectChatPanel';
import { Button } from '@/components/ui/button';

export default function ProjectChatWorkspacePage() {
  const [conversation, setConversation] = useState<ProjectAiChat | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const projectId = params.projectId as string;
  const chatId = params.chatId as string[];

  // Extract the actual chat ID from the array
  const actualChatId = chatId && chatId[0] !== 'new' ? chatId[0] : null;

  useEffect(() => {
    async function fetchConversation() {
      console.log('🔄 Fetching conversation:', { projectId, actualChatId, chatId });
      
      // If no chatId or 'new', create empty conversation
      if (!actualChatId) {
        console.log('📝 Creating new conversation');
        const newConversation: ProjectAiChat = {
          id: null,
          project_id: projectId,
          title: 'New Conversation',
          messages: [],
          updated_at: new Date().toISOString()
        };
        setConversation(newConversation);
        setIsLoading(false);
        return;
      }

      // Fetch specific conversation
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('No session found');
        setIsLoading(false);
        return;
      }

      try {
        console.log('🔍 Fetching conversation with ID:', actualChatId);
        
        const response = await fetch(`http://localhost:8000/api/projects/${projectId}/ai_chats`, {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const conversations: ProjectAiChat[] = await response.json();
        console.log('📊 All conversations:', conversations);
        
        const targetConversation = conversations.find((c: ProjectAiChat) => c.id === actualChatId);
        console.log('🎯 Target conversation found:', targetConversation);
        
        if (targetConversation) {
          // Ensure messages are properly parsed
          let messages = targetConversation.messages;
          if (typeof messages === 'string') {
            try {
              messages = JSON.parse(messages);
            } catch (parseError) {
              console.error('Error parsing messages:', parseError);
              messages = [];
            }
          }
          
          setConversation({
            ...targetConversation,
            messages: Array.isArray(messages) ? messages : []
          });
        } else {
          console.log('❌ Conversation not found, creating new one');
          setError('Conversation not found');
          // Fallback to new conversation if not found
          const newConversation: ProjectAiChat = {
            id: null,
            project_id: projectId,
            title: 'New Conversation',
            messages: [],
            updated_at: new Date().toISOString()
          };
          setConversation(newConversation);
        }
      } catch (error) {
        console.error('❌ Error fetching conversation:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');
        // Fallback to new conversation on error
        const newConversation: ProjectAiChat = {
          id: null,
          project_id: projectId,
          title: 'New Conversation',
          messages: [],
          updated_at: new Date().toISOString()
        };
        setConversation(newConversation);
      } finally {
        setIsLoading(false);
      }
    }

    fetchConversation();
  }, [projectId, actualChatId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-white">Loading conversation...</span>
      </div>
    );
  }

  if (error && !conversation) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12 border-2 border-dashed border-red-500 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-2">Error Loading Conversation</h3>
          <p className="text-secondary mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  console.log('🎨 Rendering with conversation:', conversation);
  
  return (
    <div className="h-[calc(100vh-200px)]">
      <ProjectChatPanel 
        projectId={projectId}
        conversation={conversation}
        setConversation={setConversation}
      />
    </div>
  );
}