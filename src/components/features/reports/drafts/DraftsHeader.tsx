import { FC } from 'react';
import {Button} from '../../../ui/button';
import { Search, List, LayoutGrid, Plus } from 'lucide-react';

interface DraftsHeaderProps {
  viewMode: 'table' | 'grid';
  onViewChange: (mode: 'table' | 'grid') => void;
  onNewDraft: () => void;
}

const DraftsHeader: FC<DraftsHeaderProps> = ({ viewMode, onViewChange, onNewDraft }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
      <h2 className="text-2xl font-bold text-white">Drafts</h2>
      <div className="flex items-center gap-2">
        <div className="relative"><Search size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-secondary"/><input type="text" placeholder="Search..." className="w-32 bg-surface pl-8 p-1.5 rounded-md text-sm border border-border"/></div>
        {/* --- THIS IS THE FIX: Added Filter Dropdowns --- */}
        <select className="bg-surface border border-border rounded-md px-2 py-1.5 text-sm text-secondary"><option>All Deals</option></select>
        <select className="bg-surface border border-border rounded-md px-2 py-1.5 text-sm text-secondary"><option>All Users</option></select>
        <div className="flex items-center p-1 rounded-lg bg-surface border border-border">
          <button onClick={() => onViewChange('table')} className={`p-1.5 rounded ${viewMode === 'table' ? 'bg-primary text-white' : 'text-secondary'}`}><List size={16}/></button>
          <button onClick={() => onViewChange('grid')} className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-secondary'}`}><LayoutGrid size={16}/></button>
        </div>
        <Button onClick={onNewDraft} variant="default" size="sm"><Plus size={16} className="mr-2"/>New Draft</Button>
      </div>
    </div>
  );
};

export default DraftsHeader;