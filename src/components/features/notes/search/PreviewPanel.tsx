import { FC } from 'react';
import { Note } from '../../../../types';
import IntelligentEditor from '../IntelligentEditor'; // We reuse the editor!

const PreviewPanel: FC<{ note: Note | null }> = ({ note }) => {
  if (!note) {
    return <div className="p-4 rounded-xl border border-border bg-surface/50 h-full flex items-center justify-center text-secondary"><p>Select a search result to preview</p></div>;
  }
  
  // The key prop is crucial here. It tells React to create a *new* instance of the
  // editor whenever a different note is selected, correctly resetting its internal state.
  return <IntelligentEditor key={note.id} note={note} refreshNotes={() => {}} />;
};

export default PreviewPanel;
