import { FC } from 'react';
import { MarketMapFilters } from '../../../../types';
import { SlidersHorizontal } from 'lucide-react';

interface MapFilterSidebarProps {
  filters: MarketMapFilters;
  setFilters: (filters: MarketMapFilters) => void;
}

const MapFilterSidebar: FC<MapFilterSidebarProps> = ({ filters, setFilters }) => {
  const handleFilterChange = (key: keyof MarketMapFilters, value: string | number) => {
    setFilters({ ...filters, [key]: value });
  };

  return (
    <div className="w-72 flex-shrink-0 p-4 rounded-xl border border-border bg-surface/50 h-full overflow-y-auto scrollbar-hide">
      <div className="flex items-center gap-2 mb-4">
        <SlidersHorizontal size={18}/>
        <h3 className="font-semibold text-white">Market Filters</h3>
      </div>

      {/* Company Vitals */}
      <div className="space-y-4">
        <div>
          <label className="text-xs text-secondary">Sector</label>
          <select onChange={(e) => handleFilterChange('sector', e.target.value)} value={filters.sector} className="w-full mt-1 bg-background border border-border rounded-md px-2 py-1.5 text-sm">
            <option>All</option><option>Information Technology</option><option>Financial Services</option><option>Energy</option>
          </select>
        </div>
        {/* Add Geography dropdown here if needed */}
      </div>

      {/* Financial Performance Sliders */}
      <div className="space-y-4 mt-4 pt-4 border-t border-border">
         <div>
            <label className="text-xs text-secondary flex justify-between">Min. Revenue <span>₹{filters.revenueMin} Cr</span></label>
            <input type="range" min="0" max="20000" step="500" value={filters.revenueMin} onChange={(e) => handleFilterChange('revenueMin', Number(e.target.value))} className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer"/>
        </div>
        <div>
            <label className="text-xs text-secondary flex justify-between">Min. Sales Growth <span>{filters.growthMin}%</span></label>
            <input type="range" min="0" max="100" step="5" value={filters.growthMin} onChange={(e) => handleFilterChange('growthMin', Number(e.target.value))} className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer"/>
        </div>
        <div>
            <label className="text-xs text-secondary flex justify-between">Min. EBITDA Margin <span>{filters.ebitdaMarginMin}%</span></label>
            <input type="range" min="0" max="50" step="1" value={filters.ebitdaMarginMin} onChange={(e) => handleFilterChange('ebitdaMarginMin', Number(e.target.value))} className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer"/>
        </div>
        <div>
            <label className="text-xs text-secondary flex justify-between">Min. ROE <span>{filters.roeMin}%</span></label>
            <input type="range" min="0" max="50" step="1" value={filters.roeMin} onChange={(e) => handleFilterChange('roeMin', Number(e.target.value))} className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer"/>
        </div>
      </div>
    </div>
  );
};
export default MapFilterSidebar;