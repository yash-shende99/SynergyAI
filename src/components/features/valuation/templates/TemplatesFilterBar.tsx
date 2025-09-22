import { Search, ListFilter } from 'lucide-react';

const TemplatesFilterBar = () => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 rounded-xl border border-border bg-surface/50">
      <div className="relative w-full sm:w-1/3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" size={18} />
        <input 
          type="text"
          placeholder="Search templates..."
          className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm"
        />
      </div>
      <div className="flex items-center gap-2 text-sm">
        <ListFilter size={16} className="text-secondary"/>
        <span className="text-secondary">Sort by:</span>
        <select className="bg-background border border-border rounded-md px-2 py-1">
            <option>Last Used</option>
            <option>Alphabetical</option>
            <option>Most Popular</option>
        </select>
        <select className="bg-background border border-border rounded-md px-2 py-1">
            <option>All Types</option>
            <option>DCF</option>
            <option>LBO</option>
        </select>
      </div>
    </div>
  );
};

export default TemplatesFilterBar;