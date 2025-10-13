'use client';
import { FC, useState, useEffect } from 'react';
import { Note } from '../../../types';
import {Button} from '../../ui/button';
import { Save, Trash2, Brain, Loader2 } from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';

interface IntelligentEditorProps {
  note: Note;
  refreshNotes: () => void;
}

const IntelligentEditor: FC<IntelligentEditorProps> = ({ note, refreshNotes }) => {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [isSaving, setIsSaving] = useState(false);

  // Simple debounce timer
  useEffect(() => {
    const handler = setTimeout(() => {
      if (title !== note.title || content !== note.content) {
        handleSave();
      }
    }, 2000); // Auto-save after 2 seconds of inactivity
    return () => clearTimeout(handler);
  }, [title, content]);

  const handleSave = async () => {
    setIsSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    try {
      await fetch(`http://localhost:8000/api/notes/${note.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}`},
        body: JSON.stringify({ title, content })
      });
      // No need to alert on auto-save, but we'll refresh the list to update the summary
      refreshNotes();
    } catch (error) {
      console.error("Auto-save failed:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 rounded-xl border border-border bg-surface/50 h-full flex flex-col">
      <div className="flex justify-between items-center pb-2 border-b border-border/50 mb-4">
        <input value={title} onChange={e => setTitle(e.target.value)} className="font-bold text-lg text-white bg-transparent focus:outline-none w-full"/>
        <div className="flex items-center gap-2">
          {isSaving && <Loader2 size={16} className="animate-spin text-secondary"/>}
          <Button variant="ghost" size="icon" className="text-secondary hover:text-red-500"><Trash2 size={16}/></Button>
        </div>
      </div>
      <textarea 
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Start writing your notes..."
        className="flex-1 w-full bg-transparent text-slate-300 resize-none focus:outline-none text-sm"
      />
      <div className="flex justify-end pt-4 border-t border-border/50">
        <Button size="sm" variant="secondary"><Brain size={16} className="mr-2"/>AI Tools</Button>
      </div>
    </div>
  );
};
export default IntelligentEditor;
