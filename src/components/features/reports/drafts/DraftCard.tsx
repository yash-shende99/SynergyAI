import { FC } from 'react';
import { Draft } from '../../../../types';
import StatusBadge from './StatusBadge';
import { MoreHorizontal, Copy, Trash2, User } from 'lucide-react';

interface DraftCardProps {
  draft: Draft;
  onOpen: (draft: Draft) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

const DraftCard: FC<DraftCardProps> = ({ draft, onOpen, onDelete, onDuplicate }) => (
  <button 
    onClick={() => onOpen(draft)}
    className="rounded-2xl border border-border bg-surface/50 p-6 flex flex-col group text-left transition-all duration-300 hover:border-primary/50"
  >
    <div className="flex justify-between items-start">
      <h3 className="text-lg font-bold text-white mb-2">{draft.title}</h3>
      <div className="relative">
        <button onClick={(e) => e.stopPropagation()} className="p-1 rounded-md text-secondary hover:text-white hover:bg-border opacity-0 group-hover:opacity-100 focus:opacity-100 peer"><MoreHorizontal size={16}/></button>
        <div className="absolute right-0 top-full mt-1 w-32 bg-background border border-border rounded-lg shadow-lg p-1 z-10 hidden peer-focus:block hover:block">
            <button onClick={(e) => { e.stopPropagation(); onDuplicate(draft.id); }} className="w-full text-left px-2 py-1 rounded hover:bg-surface text-sm flex items-center gap-2"><Copy size={14}/> Duplicate</button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(draft.id); }} className="w-full text-left px-2 py-1 rounded hover:bg-surface text-red-500 text-sm flex items-center gap-2"><Trash2 size={14}/> Delete</button>
        </div>
      </div>
    </div>
    <div className="flex-1">
        <StatusBadge status={draft.status}/>
    </div>
    <div className="mt-4 pt-4 border-t border-border/50 flex justify-between items-center text-xs text-secondary">
      <span>{draft.lastModified}</span>
      <div className="flex items-center gap-2">
        {/* Fixed: Check for empty avatarUrl and show fallback */}
        {draft.createdBy.avatarUrl ? (
          <img 
            src={draft.createdBy.avatarUrl} 
            alt={draft.createdBy.name} 
            className="h-5 w-5 rounded-full"
          />
        ) : (
          <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center">
            <User size={12} className="text-primary" />
          </div>
        )}
        <span>{draft.createdBy.name}</span>
      </div>
    </div>
  </button>
);

export default DraftCard;