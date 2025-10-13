import { Tag } from 'lucide-react';

const FilterPanel = () => (
  <div className="p-4 rounded-xl border border-border bg-surface/50 h-full">
    <h3 className="font-semibold text-white mb-4">Filters</h3>
    <div>
        <h4 className="text-sm font-semibold text-secondary mb-2">AI-Generated Tags</h4>
        <div className="flex flex-wrap gap-1 text-xs">
            <span className="px-2 py-1 bg-surface rounded-full cursor-pointer hover:bg-border">#Valuation</span>
            <span className="px-2 py-1 bg-surface rounded-full cursor-pointer hover:bg-border">#Logistics</span>
            {/* ... Tags would be populated dynamically ... */}
        </div>
    </div>
  </div>
);

export default FilterPanel;
