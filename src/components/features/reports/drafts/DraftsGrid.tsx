import { FC } from 'react';
import { Draft } from '../../../../types';
import DraftCard from './DraftCard';

// --- THIS IS THE FIX ---
// 1. Define the props interface to accept the functions.
interface DraftsGridProps {
  drafts: Draft[];
  onOpen: (draft: Draft) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

const DraftsGrid: FC<DraftsGridProps> = ({ drafts, onOpen, onDelete, onDuplicate }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {drafts.map(draft => (
      // 2. Pass the functions down to each individual card.
      <DraftCard 
        key={draft.id} 
        draft={draft}
        onOpen={onOpen}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
      />
    ))}
  </div>
);

export default DraftsGrid;