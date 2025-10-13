'use client';

import { useState, useCallback } from 'react';
import { NoteSearchResult, Note } from '../../../../types';
import { supabase } from '../../../../lib/supabaseClient';
import SearchWorkspace from '../../../../components/features/notes/search/SearchWorkspace';

export default function NotesSearchPage() {
  const [results, setResults] = useState<NoteSearchResult[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setIsLoading(true);
    setError('');
    setSelectedNote(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");
      const response = await fetch('http://localhost:8000/api/notes/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify({ query })
      });
      if (!response.ok) throw new Error("Search failed.");
      const data = await response.json();
      setResults(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSelectResult = async (result: NoteSearchResult) => {
    // When a result is clicked, fetch the full note content for the editor
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    try {
        const { data, error } = await supabase.from('notes').select('*').eq('id', result.id).single();
        if (error) throw error;
        setSelectedNote(data as Note);
    } catch (error) {
        console.error("Failed to fetch full note:", error);
    }
  };

  return (
    <SearchWorkspace
      onSearch={handleSearch}
      results={results}
      selectedNote={selectedNote}
      onSelectResult={handleSelectResult}
      isLoading={isLoading}
      error={error}
    />
  );
}
