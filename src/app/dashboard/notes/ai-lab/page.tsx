'use client';

import { useState, useEffect } from 'react';
import { Note, AiLabResult, AiLabAction } from '../../../../types';
import { Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from '../../../../lib/supabaseClient';
import AiLabWorkspace from '../../../../components/features/notes/ai-lab/AiLabWorkspace';

export default function AiLabPage() {
  const [allNotes, setAllNotes] = useState<Note[]>([]);
  const [result, setResult] = useState<AiLabResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchNotes() {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setIsLoading(false); return; }
      try {
        const response = await fetch('http://localhost:8000/api/notes', { headers: { 'Authorization': `Bearer ${session.access_token}` }});
        if (!response.ok) throw new Error("Failed to fetch notes.");
        const data = await response.json();
        setAllNotes(data);
      } catch (err: any) { setError(err.message); } 
      finally { setIsLoading(false); }
    }
    fetchNotes();
  }, []);

  const handleRunAction = async (noteIds: string[], action: AiLabAction) => {
    setIsProcessing(true);
    setError('');
    setResult(null);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    try {
      const response = await fetch('http://localhost:8000/api/notes/ai_lab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify({ note_ids: noteIds, action: action })
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "AI Lab action failed.");
      }
      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>;
  }

  return (
    <AiLabWorkspace
      allNotes={allNotes}
      onRunAction={handleRunAction}
      isProcessing={isProcessing}
      result={result}
      error={error}
    />
  );
}