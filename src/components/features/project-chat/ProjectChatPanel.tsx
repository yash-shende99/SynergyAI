// components/features/project-chat/ProjectChatPanel.tsx
'use client';

import { FC, useState, useRef, useEffect } from 'react';
import { ProjectAiChat, ChatMessage } from '../../../types';
import { supabase } from '../../../lib/supabaseClient';
import { Bot, Send, Trash2, MessageSquare } from 'lucide-react';
import MessageBubble from '../chat/ask/MessageBubble';
import AILoadingBubble from '../chat/ask/AILoadingBubble';
import { Button } from '../../ui/button';

interface ProjectChatPanelProps {
  projectId: string;
  conversation: ProjectAiChat | null;
  setConversation: React.Dispatch<React.SetStateAction<ProjectAiChat | null>>;
}

const ProjectChatPanel: FC<ProjectChatPanelProps> = ({ 
  projectId, 
  conversation, 
  setConversation 
}) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Debug logging
  console.log('💬 ProjectChatPanel received:', { 
    projectId, 
    conversation: conversation ? {
      id: conversation.id,
      title: conversation.title,
      messageCount: conversation.messages?.length,
      hasMessages: !!conversation.messages,
      messages: conversation.messages
    } : 'null' 
  });

  useEffect(() => {
    console.log('🔄 ProjectChatPanel conversation updated:', conversation);
  }, [conversation]);

  const messages = conversation?.messages || [];

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    const currentMessages: ChatMessage[] = [...messages, userMessage];
    
    // Optimistically update UI with proper typing
    setConversation((prev: ProjectAiChat | null) => prev ? {
      ...prev,
      messages: currentMessages
    } : {
      id: null,
      project_id: projectId,
      title: 'New Conversation',
      messages: currentMessages,
      updated_at: new Date().toISOString()
    });
    
    setInput('');
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("User not authenticated");

      const response = await fetch(`http://localhost:8000/api/projects/${projectId}/ai_chat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${session.access_token}` 
        },
        body: JSON.stringify({ 
          question: input, 
          existing_messages: currentMessages, 
          chat_id: conversation?.id 
        })
      });

      if (!response.ok) throw new Error("Failed to get AI response");

      const updatedConversation: ProjectAiChat = await response.json();
      setConversation(updatedConversation);

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = { 
        role: 'assistant', 
        content: "Sorry, I encountered an error. Please try again." 
      };
      setConversation((prev: ProjectAiChat | null) => prev ? {
        ...prev,
        messages: [...currentMessages, errorMessage]
      } : null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = async () => {
    if (conversation?.id) {
      // Delete from server
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await fetch(`http://localhost:8000/api/projects/${projectId}/ai_chats/${conversation.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        });
      }
    }
    setConversation(null);
    setInput('');
  };

  return (
    <div className="h-full flex flex-col bg-surface/50 rounded-xl border border-border">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Bot className="h-6 w-6 text-primary" />
          <div>
            <h3 className="font-bold text-white">
              {conversation?.title || 'Project AI Co-pilot'}
            </h3>
            <p className="text-xs text-secondary">
              {conversation?.id ? `Loaded conversation • ${messages.length} messages` : 'New conversation'}
            </p>
          </div>
        </div>
        <Button
          onClick={handleClearChat}
          variant="outline"
          size="sm"
          disabled={!conversation}
        >
          <Trash2 size={16} className="mr-2" />
          Clear
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-secondary">
            <MessageSquare size={48} className="mb-4 opacity-50" />
            <p className="text-lg font-semibold">Project AI Co-pilot</p>
            <p className="text-sm mt-2">
              Ask questions about this project's documents,<br />
              due diligence findings, or strategic considerations.
            </p>
          </div>
        )}
        
        {messages.map((msg: ChatMessage, index: number) => (
          <MessageBubble key={index} message={msg} />
        ))}
        
        {isLoading && <AILoadingBubble />}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-border">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
            placeholder="Ask about due diligence, risks, synergies, or project specifics..."
            className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-white placeholder:text-secondary resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            rows={2}
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            disabled={!input.trim() || isLoading}
            className="flex-shrink-0"
          >
            <Send size={18} />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProjectChatPanel;