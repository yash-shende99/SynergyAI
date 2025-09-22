import { FC } from 'react';
import {Button} from '../../../ui/button';
import { Search, Plus } from 'lucide-react';
import Link from 'next/link';

// --- THIS IS THE FIX ---
// We have removed the unnecessary 'viewMode' and 'onViewChange' props
// from the interface, as this component no longer manages that state.
interface TemplatesHeaderProps {
  // No props are needed for this version
}

const TemplatesHeader: FC<TemplatesHeaderProps> = () => (
  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
    <h2 className="text-2xl font-bold text-white">Report Templates</h2>
    <div className="flex items-center gap-2">
      <div className="relative">
        <Search size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-secondary"/>
        <input 
          type="text" 
          placeholder="Search..." 
          className="w-40 bg-surface pl-8 p-1.5 rounded-md text-sm border border-border"
        />
      </div>
      <select className="bg-surface border border-border rounded-md px-2 py-1.5 text-sm text-secondary">
        <option>Category: All</option>
      </select>
      <select className="bg-surface border border-border rounded-md px-2 py-1.5 text-sm text-secondary">
        <option>Created by: All</option>
      </select>
      <Link href="/dashboard/reports/templates/new">
        <Button variant="default" size="sm">
          <Plus size={16} className="mr-2"/>
          Create Template
        </Button>
      </Link>
    </div>
  </div>
);

export default TemplatesHeader;