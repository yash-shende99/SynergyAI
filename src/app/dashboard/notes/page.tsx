'use client';

import { useState, useEffect } from 'react';
import { Note } from '../../../types';
import { Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';
import NotesWorkspace from '../../../components/features/notes/NotesWorkspace';

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNotes = async () => {
    setIsLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setIsLoading(false); return; }
    try {
      const response = await fetch('http://localhost:8000/api/notes', { headers: { 'Authorization': `Bearer ${session.access_token}` }});
      if (!response.ok) throw new Error("Failed to fetch notes.");
      const data = await response.json();
      setNotes(data);
      // If there's no active note, select the first one by default
      if (!activeNoteId && data.length > 0) {
        setActiveNoteId(data[0].id);
      }
    } catch (err: any) { setError(err.message); } 
    finally { setIsLoading(false); }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  if (isLoading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>;
  }
  
  if (error) {
    return <div className="text-red-400 text-center py-16"><AlertTriangle className="mx-auto"/><p>{error}</p></div>;
  }

  return (
    <NotesWorkspace
      notes={notes}
      activeNoteId={activeNoteId}
      setActiveNoteId={setActiveNoteId}
      refreshNotes={fetchNotes}
    />
  );
}
