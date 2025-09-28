'use client';

import { FC, useState, useRef, useEffect } from 'react';
// --- THIS IS THE FIX: We import the necessary types from React ---
import React from 'react'; 
import { VdrConversation, VdrChatMessage, VdrSource } from '../../../../types';
import MessageBubble from './MessageBubble';
import { Send, Loader2 } from 'lucide-react';
import { supabase } from '../../../../lib/supabaseClient';

interface ChatPanelProps {
  projectId: string;
  conversation: VdrConversation | null;
  // This is the correct, professional type for a state setter function
  setConversation: React.Dispatch<React.SetStateAction<VdrConversation | null>>;
  onSourceClick: (source: VdrSource) => void;
}

const ChatPanel: FC<ChatPanelProps> = ({ projectId, conversation, setConversation, onSourceClick }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const messages = conversation?.messages || [];

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: VdrChatMessage = { role: 'user', content: input };
    const currentMessages = [...messages, userMessage];
    
    // Optimistically update the UI
    setConversation(prev => ({ id: prev?.id || null, messages: currentMessages }));
    setInput('');
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("User not authenticated");

      const response = await fetch(`http://localhost:8000/api/projects/${projectId}/vdr/qa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        // Send the current message history along with the new question
        body: JSON.stringify({ question: input, existing_messages: currentMessages })
      });
      if (!response.ok) throw new Error("Failed to get response from AI.");

      const data = await response.json();
      const assistantMessage: VdrChatMessage = data;
      
      // Update the state with the final, persisted conversation
      setConversation(prev => {
          if (!prev) return null; // Should not happen but is a safe guard
          return { ...prev, id: prev.id || 'new_id_from_server', messages: [...currentMessages, assistantMessage] };
      });

    } catch (error) {
      console.error(error);
      const errorMessage: VdrChatMessage = { role: 'assistant', content: "Sorry, an error occurred." };
      setConversation(prev => {
          if (!prev) return null;
          return {...prev, messages: [...currentMessages, errorMessage]};
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 rounded-xl border border-border bg-surface/50 h-full flex flex-col">
      <h3 className="font-semibold text-white mb-4">AI Q&A for Project</h3>
      <div className="flex-1 space-y-4 overflow-y-auto pr-2">
        {messages.map((msg, index) => (
          <MessageBubble key={index} message={msg} onSourceClick={onSourceClick} />
        ))}
        {isLoading && <div className="flex justify-start items-center gap-2 text-secondary"><Loader2 className="animate-spin text-primary"/> Thinking...</div>}
        <div ref={scrollRef} />
      </div>
      <form onSubmit={handleSendMessage} className="mt-4 relative">
        <input value={input} onChange={e => setInput(e.target.value)} disabled={isLoading} placeholder="Ask about this project's documents..." className="w-full pl-4 pr-12 py-3 bg-background border border-border rounded-lg"/>
        <button type="submit" disabled={isLoading} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary p-1 rounded-md hover:bg-surface disabled:opacity-50">
            <Send size={20} />
        </button>
      </form>
    </div>
  );
};
export default ChatPanel;