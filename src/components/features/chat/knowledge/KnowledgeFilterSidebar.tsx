import { FC } from 'react';
import { Filter } from 'lucide-react';

// --- THIS IS THE FIX ---

interface KnowledgeFilterSidebarProps {
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
}

// A cleaner way to manage our filter options
const filterOptions = ['All Sources', 'VDR Documents', 'Global DB', 'News & Filings'];

const KnowledgeFilterSidebar: FC<KnowledgeFilterSidebarProps> = ({ activeFilter, setActiveFilter }) => {
  return (
    <div className="p-4 rounded-xl border border-border bg-surface/50 h-full space-y-4">
      <div className="flex items-center gap-2">
        <Filter size={18} />
        <h3 className="font-semibold text-white">Filters</h3>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-secondary mb-2">Source Type</h4>
        <div className="space-y-1 text-sm">
          {/* We now map over the options to create the buttons */}
          {filterOptions.map(option => (
            <button
              key={option}
              onClick={() => setActiveFilter(option)}
              // This conditional class applies the "active" style
              className={`w-full text-left p-2 rounded transition-colors ${
                activeFilter === option
                  ? 'bg-primary/20 text-primary font-semibold'
                  // The line below should be updated to use the correct class for the inactive state
                  : 'text-secondary hover:bg-surface'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Other filters remain the same */}
      <div>
        <h4 className="text-sm font-semibold text-secondary mb-2">Date Range</h4>
        <select className="w-full bg-background border border-border rounded-md px-2 py-1.5 text-sm">
          <option>Last 30 days</option>
          <option>Last 90 days</option>
          <option>All Time</option>
        </select>
      </div>
       <div>
        <h4 className="text-sm font-semibold text-secondary mb-2">Company</h4>
        <input type="text" placeholder="Filter by company name..." className="w-full bg-background border border-border rounded-md px-2 py-1.5 text-sm"/>
      </div>
    </div>
  );
};

export default KnowledgeFilterSidebar;