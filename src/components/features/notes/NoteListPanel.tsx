'use client';
import { FC } from 'react';
import { Note } from '../../../types';
import { Plus, Search } from 'lucide-react';
import {Button} from '../../ui/button';
import { supabase } from '../../../lib/supabaseClient';

interface NoteListPanelProps {
  notes: Note[];
  activeNoteId: string | null;
  onSelectNote: (id: string) => void;
  refreshNotes: () => void;
}

const NoteListPanel: FC<NoteListPanelProps> = ({ notes, activeNoteId, onSelectNote, refreshNotes }) => {
    
  const handleNewNote = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    try {
      await fetch('http://localhost:8000/api/notes', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      refreshNotes(); // This will refetch the list, and the new note will appear at the top
    } catch (error) {
      alert("Failed to create new note.");
    }
  };
    
  return (
    <div className="p-4 rounded-xl border border-border bg-surface/50 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-white">My Notes</h3>
        <Button onClick={handleNewNote} size="sm" variant="default"><Plus size={16}/></Button>
      </div>
      {/* ... Search bar would go here ... */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
        {notes.map(note => (
          <button key={note.id} onClick={() => onSelectNote(note.id)} 
            className={`w-full text-left p-3 rounded-lg ${activeNoteId === note.id ? 'bg-surface' : 'hover:bg-surface/80'}`}>
            <p className="font-medium text-white truncate">{note.title}</p>
            <p className="text-xs text-secondary mt-1 line-clamp-2">{note.summary || 'No summary yet...'}</p>
          </button>
        ))}
      </div>
    </div>
  );
};
export default NoteListPanel;
