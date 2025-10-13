import { FC } from 'react';
import { Note } from '../../../types';
import NoteListPanel from './NoteListPanel';
import IntelligentEditor from './IntelligentEditor';

interface NotesWorkspaceProps {
  notes: Note[];
  activeNoteId: string | null;
  setActiveNoteId: (id: string | null) => void;
  refreshNotes: () => void;
}

const NotesWorkspace: FC<NotesWorkspaceProps> = ({ notes, activeNoteId, setActiveNoteId, refreshNotes }) => {
  const activeNote = notes.find(note => note.id === activeNoteId);

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[80vh]">
      <div className="md:col-span-4 lg:col-span-3">
        <NoteListPanel 
          notes={notes}
          activeNoteId={activeNoteId}
          onSelectNote={setActiveNoteId}
          refreshNotes={refreshNotes}
        />
      </div>
      <div className="md:col-span-8 lg:col-span-9">
        {activeNote ? (
          <IntelligentEditor 
            key={activeNote.id} // Use key to force re-mount on note change
            note={activeNote} 
            refreshNotes={refreshNotes}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-secondary">
            Select a note to view or create a new one.
          </div>
        )}
      </div>
    </div>
  );
};
export default NotesWorkspace;
