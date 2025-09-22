const GraphFiltersPanel = () => (
  <div>
    <h4 className="text-sm font-semibold text-secondary mb-2">Filters</h4>
    <div className="p-3 bg-background/50 rounded-lg space-y-2">
        <label className="text-xs text-slate-300">Node Type:</label>
        <select className="w-full bg-surface border border-border rounded-md px-2 py-1 text-xs">
            <option>All Types</option>
            <option>Company</option>
            <option>Executive</option>
        </select>
    </div>
  </div>
);
export default GraphFiltersPanel;