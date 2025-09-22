import { FC } from 'react';
import { Draft } from '../../../../types';
import StatusBadge from './StatusBadge';
import { MoreHorizontal, Edit, Copy, Trash2 } from 'lucide-react';

interface DraftsTableProps {
  drafts: Draft[];
  onOpen: (draft: Draft) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

const DraftsTable: FC<DraftsTableProps> = ({ drafts, onOpen, onDelete, onDuplicate }) => (
  <div className="rounded-xl border border-border bg-surface/50 overflow-hidden">
    <table className="w-full text-left text-sm">
      <thead className="border-b border-border bg-surface/50 text-xs text-secondary uppercase">
        <tr>
          <th className="p-3">Title</th><th className="p-3">Created By</th>
          <th className="p-3">Last Modified</th><th className="p-3">Status</th><th className="p-3"></th>
        </tr>
      </thead>
      <tbody>
        {drafts.map(draft => (
          <tr key={draft.id} onClick={() => onOpen(draft)} className="border-b border-border/50 hover:bg-surface cursor-pointer group">
            <td className="p-3 font-medium text-white">{draft.title}</td>
            <td className="p-3 text-slate-300">
              <div className="flex items-center gap-2">
                <img src={draft.createdBy.avatarUrl} alt={draft.createdBy.name} className="h-6 w-6 rounded-full"/>
                <span>{draft.createdBy.name}</span>
              </div>
            </td>
            <td className="p-3 text-slate-400">{draft.lastModified}</td>
            <td className="p-3"><StatusBadge status={draft.status}/></td>
            <td className="p-3 text-right">
              <div className="relative">
                <button onClick={(e) => e.stopPropagation()} className="p-1 rounded-md text-secondary hover:text-white hover:bg-border opacity-0 group-hover:opacity-100 focus:opacity-100 peer"><MoreHorizontal size={16}/></button>
                <div className="absolute right-0 top-full mt-1 w-32 bg-background border border-border rounded-lg shadow-lg p-1 z-10 hidden peer-focus:block hover:block">
                    <button onClick={(e) => { e.stopPropagation(); onOpen(draft); }} className="w-full text-left px-2 py-1 rounded hover:bg-surface text-sm flex items-center gap-2"><Edit size={14}/> Rename</button>
                    <button onClick={(e) => { e.stopPropagation(); onDuplicate(draft.id); }} className="w-full text-left px-2 py-1 rounded hover:bg-surface text-sm flex items-center gap-2"><Copy size={14}/> Duplicate</button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(draft.id); }} className="w-full text-left px-2 py-1 rounded hover:bg-surface text-red-500 text-sm flex items-center gap-2"><Trash2 size={14}/> Delete</button>
                </div>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
export default DraftsTable;