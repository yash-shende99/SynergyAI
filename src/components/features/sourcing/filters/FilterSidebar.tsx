import { FC } from 'react';
import FilterGroup from './FilterGroup';
import type { Filters } from '../../../../app/dashboard/sourcing/filters/page';


interface FilterSidebarProps {
  filters: Filters;
  setFilters: (filters: Filters) => void;
}

const FilterSidebar: FC<FilterSidebarProps> = ({ filters, setFilters }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // For sliders, we convert to number; for select, it remains a string
    const newValue = e.target.type === 'range' ? Number(value) : value;
    setFilters({ ...filters, [name]: newValue });
  };

  return (
     <div className="p-4 rounded-xl border border-border bg-surface/50 h-full space-y-4">
      <FilterGroup title="Industry & Location">
        <label className="text-xs text-secondary">Sector</label>
        <select name="sector" value={filters.sector} onChange={handleInputChange} className="w-full bg-background border border-border rounded-md px-2 py-1.5 text-sm">
          <option value="All">All Sectors</option>
          <option value="Energy">Energy</option>
          <option>Logistics</option>
          <option>SaaS</option>
          <option>FinTech</option>
          <option>Information Technology</option>
          <option>Financial Services</option>
        </select>
        <label className="text-xs text-secondary mt-2">Headquarters (State)</label>
        <select name="hqState" value={filters.hqState} onChange={handleInputChange} className="w-full bg-background border border-border rounded-md px-2 py-1.5 text-sm">
            <option value="All">All States</option>
            <option>Maharashtra</option>
            <option>Karnataka</option>
            <option>Haryana</option>
            <option>Uttar Pradesh</option>
        </select>
      </FilterGroup>

      <FilterGroup title="Size Filters">
        <label className="text-xs text-secondary">Min. Revenue (₹{filters.revenueMin.toLocaleString('en-IN')} Cr)</label>
        <input type="range" name="revenueMin" min="0" max="20000" step="500" value={filters.revenueMin} onChange={handleInputChange} className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer"/>
        <label className="text-xs text-secondary mt-2">Max. Employees ({filters.employeeMax.toLocaleString('en-IN')})</label>
        <input type="range" name="employeeMax" min="0" max="500000" step="1000" value={filters.employeeMax} onChange={handleInputChange} className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer"/>
      </FilterGroup>
      
      <FilterGroup title="Financial Ratios">
        <label className="text-xs text-secondary">Min. EBITDA Margin ({filters.ebitdaMarginMin}%)</label>
        <input type="range" name="ebitdaMarginMin" min="0" max="50" step="1" value={filters.ebitdaMarginMin} onChange={handleInputChange} className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer"/>
        <label className="text-xs text-secondary mt-2">Min. Return on Equity ({filters.roeMin}%)</label>
        <input type="range" name="roeMin" min="0" max="50" step="1" value={filters.roeMin} onChange={handleInputChange} className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer"/>
      </FilterGroup>
    </div>
  );
};

export default FilterSidebar;