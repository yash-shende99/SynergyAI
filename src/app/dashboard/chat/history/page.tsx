'use client';

import { useState, useEffect } from 'react';
import { Conversation } from '../../../../types';
import HistorySection from '../../../../components/features/chat/history/HistorySection';
import { Loader2 } from 'lucide-react';
import { supabase } from '../../../../lib/supabaseClient';

export default function HistoryPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In your HistoryPage component, add better error handling:
    async function fetchHistory() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:8000/api/chat/history', {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch chat history: ${response.status}`);
        }

        const data = await response.json();
        const parsedData = data.map((convo: any) => ({
          ...convo,
          messages: convo.messages
        }));

        setConversations(parsedData);
      } catch (error) {
        console.error('Error fetching history:', error);
        // You might want to show an error message to the user here
      } finally {
        setIsLoading(false);
      }
    }
    fetchHistory();
  }, []);

  if (isLoading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <HistorySection conversations={conversations} />
  );
}