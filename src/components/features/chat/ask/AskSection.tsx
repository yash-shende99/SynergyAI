'use client';

import { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../../../../types';
import ChatWindow from './ChatWindow';
import ChatInputBar from './ChatInputBar';
import { supabase } from '../../../../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AskSection() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [suggestedQuestion, setSuggestedQuestion] = useState<string>('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();


  useEffect(() => {
    const continuedConversation = sessionStorage.getItem('continueConversation');

    if (continuedConversation) {
      try {
        const conversationData = JSON.parse(continuedConversation);
        setMessages(conversationData.messages);
        setConversationId(conversationData.id);

        // Clear the storage after loading
        sessionStorage.removeItem('continueConversation');
      } catch (error) {
        console.error('Error parsing continued conversation:', error);
        sessionStorage.removeItem('continueConversation');
      }
    }

    const suggestedQ = sessionStorage.getItem('suggestedQuestion');
    if (suggestedQ) {
      setSuggestedQuestion(suggestedQ);
      sessionStorage.removeItem('suggestedQuestion');

      // Focus and set the input value after a small delay to ensure the input is rendered
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.value = suggestedQ;
          inputRef.current.focus();
        }
      }, 100);
    }

  }, []);

  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim()) return;

    const userMessage: ChatMessage = { role: 'user', content: messageText };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("User not authenticated");

      // Get the AI's response
      const aiResponse = await fetch('http://localhost:8000/api/ai/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ question: messageText })
      });

      if (!aiResponse.ok) {
        throw new Error(`AI query failed: ${aiResponse.status}`);
      }

      const aiData = await aiResponse.json();
      const assistantMessage: ChatMessage = { role: 'assistant', content: aiData.answer };
      const updatedMessages = [...newMessages, assistantMessage];
      setMessages(updatedMessages);

      // Auto-save logic
      const savePayload = { messages: updatedMessages };

      if (conversationId) {
        // Update existing conversation
        const updateResponse = await fetch(`http://localhost:8000/api/chat/history/${conversationId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify(savePayload)
        });

        if (!updateResponse.ok) {
          console.error("Failed to update conversation");
        }
      } else {
        // Create new conversation
        const saveResponse = await fetch('http://localhost:8000/api/chat/history', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify(savePayload)
        });

        if (saveResponse.ok) {
          const savedData = await saveResponse.json();
          setConversationId(savedData.id);
        } else {
          console.error("Failed to save conversation");
        }
      }

    } catch (error) {
      console.error(error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: "Sorry, I encountered an error. Please try again."
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <ChatWindow messages={messages} isLoading={isLoading} />
      </div>
      <div className="flex-shrink-0 pt-4">
        <Button
          onClick={() => {
            setMessages([]);
            setConversationId(null);
            sessionStorage.removeItem('continueConversation');
          }}
          variant="outline"
          size="sm"
          className="mb-4"
        >
          <Trash2 size={16} className="mr-2" />
          Clear Chat
        </Button>
        <ChatInputBar
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          ref={inputRef}
          initialValue={suggestedQuestion}
        />      </div>
    </div>
  );
}