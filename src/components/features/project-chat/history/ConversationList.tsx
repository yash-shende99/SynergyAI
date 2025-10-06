// components/features/project-chat/history/ConversationList.tsx
'use client';

import { FC } from 'react';
import { ProjectAiChat, ChatMessage } from '../../../../types';
import { MessageSquare, Plus, Calendar } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../../../ui/button';

interface ConversationListProps {
  conversations: ProjectAiChat[];
  projectId: string;
}

const ConversationList: FC<ConversationListProps> = ({ conversations, projectId }) => {
  console.log('ConversationList received:', conversations);
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      return date.toLocaleDateString();
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Helper function to safely get messages
  const getMessages = (convo: ProjectAiChat): ChatMessage[] => {
    if (!convo.messages) return [];
    
    // If messages is a string, try to parse it
    if (typeof convo.messages === 'string') {
      try {
        return JSON.parse(convo.messages);
      } catch (error) {
        console.error('Error parsing messages string:', error);
        return [];
      }
    }
    
    // If it's already an array, return it
    return Array.isArray(convo.messages) ? convo.messages : [];
  };

  // Safe function to get last message content
  const getLastMessageContent = (convo: ProjectAiChat): string => {
    const messages = getMessages(convo);
    
    if (messages.length === 0) {
      return 'No messages yet';
    }
    
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage?.content) {
      return 'Empty message';
    }
    
    // Clean up the content (remove markdown, etc.)
    const cleanContent = lastMessage.content
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown
      .replace(/\n/g, ' ') // Replace newlines with spaces
      .trim();
    
    return cleanContent.substring(0, 100) + (cleanContent.length > 100 ? '...' : '');
  };

  // If conversations is null or undefined
  if (!conversations) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12 border-2 border-dashed border-red-500 rounded-xl">
          <MessageSquare size={48} className="mx-auto text-secondary mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Data Received</h3>
          <p className="text-secondary mb-4">
            Conversations data is null or undefined
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Project Chat History</h1>
          <p className="text-secondary mt-1">
            {conversations.length} conversation{conversations.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <Link href={`/dashboard/project/${projectId}/chat/new`}>
          <Button>
            <Plus size={16} className="mr-2" />
            New Chat
          </Button>
        </Link>
      </div>

      {conversations.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
          <MessageSquare size={48} className="mx-auto text-secondary mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No conversations yet</h3>
          <p className="text-secondary mb-4">
            Start a new chat to discuss this project with AI
          </p>
          <Link href={`/dashboard/project/${projectId}/chat/new`}>
            <Button>Start First Conversation</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {conversations.map((convo: ProjectAiChat) => {
            const messages = getMessages(convo);
            const messageCount = messages.length;
            const lastMessageContent = getLastMessageContent(convo);

            return (
              <Link 
                key={convo.id} 
                href={`/dashboard/project/${projectId}/chat/${convo.id}`}
                className="block"
              >
                <div className="p-4 rounded-lg bg-surface border border-border hover:border-primary transition-colors group">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-white group-hover:text-primary transition-colors">
                      {convo.title || 'Untitled Conversation'}
                    </h3>
                    <div className="flex items-center text-xs text-secondary">
                      <Calendar size={12} className="mr-1" />
                      {formatDate(convo.updated_at)}
                    </div>
                  </div>
                  <p className="text-sm text-secondary mb-2">
                    {messageCount} message{messageCount !== 1 ? 's' : ''}
                  </p>
                  <p className="text-sm text-secondary truncate">
                    Last: {lastMessageContent}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ConversationList;