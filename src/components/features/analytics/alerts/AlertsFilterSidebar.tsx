import { Filter } from 'lucide-react';

const riskTypes = ['Financial', 'Legal', 'Market', 'Reputational'];
const priorities = ['Critical', 'High', 'Medium', 'Low'];

const AlertsFilterSidebar = () => {
  return (
    <div className="p-4 rounded-xl border border-border bg-surface/50 h-full space-y-4">
      <div className="flex items-center gap-2">
        <Filter size={18} />
        <h3 className="font-semibold text-white">Filter Alerts</h3>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-secondary mb-2">Risk Type</h4>
        <div className="space-y-1 text-sm">
          {riskTypes.map(type => (
            <label key={type} className="flex items-center gap-2 p-1 rounded text-slate-300">
              <input type="checkbox" className="h-4 w-4 rounded bg-surface border-border text-primary"/>
              <span>{type}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-secondary mb-2">Priority</h4>
        <div className="flex flex-wrap gap-2">
            <button className="px-2 py-1 text-xs bg-red-500/80 text-white rounded">Critical</button>
            <button className="px-2 py-1 text-xs bg-orange-500/80 text-white rounded">High</button>
            <button className="px-2 py-1 text-xs bg-amber-500/80 text-white rounded">Medium</button>
            <button className="px-2 py-1 text-xs bg-blue-500/80 text-white rounded">Low</button>
        </div>
      </div>
    </div>
  );
};

export default AlertsFilterSidebar;