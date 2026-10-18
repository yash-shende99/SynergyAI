import { FC } from 'react';
import { Filter } from 'lucide-react';

// --- THIS IS THE FIX ---

interface KnowledgeFilterSidebarProps {
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  companyFilter: string;
  setCompanyFilter: (filter: string) => void;
  dateRange: string;
  setDateRange: (range: string) => void;
}

// A cleaner way to manage our filter options
const filterOptions = ['All Sources', 'VDR Documents', 'Global DB', 'News & Filings'];

const KnowledgeFilterSidebar: FC<KnowledgeFilterSidebarProps> = ({
  activeFilter,
  setActiveFilter,
  companyFilter,
  setCompanyFilter,
  dateRange,
  setDateRange,
}) => {
  return (
    <div className="p-4 rounded-xl border border-border bg-surface/50 h-full space-y-4">
      <div className="flex items-center gap-2">
        <Filter size={18} />
        <h3 className="font-semibold text-white">Filters</h3>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-secondary mb-2">Source Type</h4>
        <div className="space-y-1 text-sm">
          {filterOptions.map(option => (
            <button
              key={option}
              onClick={() => setActiveFilter(option)}
              className={`w-full text-left p-2 rounded transition-colors ${
                activeFilter === option
                  ? 'bg-primary/20 text-primary font-semibold'
                  : 'text-secondary hover:bg-surface'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-secondary mb-2">Date Range</h4>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="w-full bg-background border border-border rounded-md px-2 py-1.5 text-sm text-white"
        >
          <option>Last 30 days</option>
          <option>Last 90 days</option>
          <option>All Time</option>
        </select>
      </div>
      <div>
        <h4 className="text-sm font-semibold text-secondary mb-2">Company</h4>
        <input
          type="text"
          value={companyFilter}
          onChange={(e) => setCompanyFilter(e.target.value)}
          placeholder="Filter by company name..."
          className="w-full bg-background border border-border rounded-md px-2 py-1.5 text-sm text-white"
        />
      </div>
    </div>
  );
};

export default KnowledgeFilterSidebar;