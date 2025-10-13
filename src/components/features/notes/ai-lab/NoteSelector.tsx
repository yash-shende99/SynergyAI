'use client';
import { FC } from 'react';
import { Note } from '../../../../types';

interface NoteSelectorProps {
  notes: Note[];
  selectedNoteIds: string[];
  setSelectedNoteIds: (ids: string[]) => void;
}

const NoteSelector: FC<NoteSelectorProps> = ({ notes, selectedNoteIds, setSelectedNoteIds }) => {

  const handleToggle = (id: string) => {
    if (selectedNoteIds.includes(id)) {
      setSelectedNoteIds(selectedNoteIds.filter(noteId => noteId !== id));
    } else {
      setSelectedNoteIds([...selectedNoteIds, id]);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto space-y-2 pr-2 border border-border bg-background/50 rounded-lg p-2">
      {notes.map(note => (
        <label key={note.id} className={`flex items-start gap-3 p-2 rounded-md cursor-pointer transition-colors ${selectedNoteIds.includes(note.id) ? 'bg-primary/20' : 'hover:bg-surface'}`}>
          <input 
            type="checkbox"
            checked={selectedNoteIds.includes(note.id)}
            onChange={() => handleToggle(note.id)}
            className="mt-1 h-4 w-4 rounded bg-surface border-border text-primary focus:ring-primary/50"
          />
          <div>
            <p className="font-medium text-white text-sm">{note.title}</p>
            <p className="text-xs text-secondary line-clamp-1">{note.summary || 'No summary'}</p>
          </div>
        </label>
      ))}
    </div>
  );
};
export default NoteSelector;
