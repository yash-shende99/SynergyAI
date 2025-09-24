'use client';

import { FC } from 'react';
import { Filter } from 'lucide-react';
import { AlertPriority, AlertType } from '../../../../types';

// Define the available filter options. These match our backend 'events' table.
const riskTypes: AlertType[] = ['Financial', 'Legal', 'Market', 'Reputational', 'Operational', 'Leadership'];
const priorities: AlertPriority[] = ['Critical', 'High', 'Medium', 'Low'];

// Define the props, which include the current filter state and the function to update it.
interface AlertsFilterSidebarProps {
    filters: { priorities: AlertPriority[], types: AlertType[] };
    setFilters: (filters: { priorities: AlertPriority[], types: AlertType[] }) => void;
}

const AlertsFilterSidebar: FC<AlertsFilterSidebarProps> = ({ filters, setFilters }) => {

  // This function handles toggling a risk type in the filter state.
  const handleTypeToggle = (type: AlertType) => {
    const newTypes = filters.types.includes(type)
      ? filters.types.filter(t => t !== type) // If it exists, remove it
      : [...filters.types, type];             // If it doesn't exist, add it
    setFilters({ ...filters, types: newTypes });
  };

  // This function handles toggling a priority in the filter state.
  const handlePriorityToggle = (priority: AlertPriority) => {
    const newPriorities = filters.priorities.includes(priority)
        ? filters.priorities.filter(p => p !== priority)
        : [...filters.priorities, priority];
    setFilters({ ...filters, priorities: newPriorities });
  };
  
  return (
    <div className="p-4 rounded-xl border border-border bg-surface/50 h-full space-y-6">
      <div className="flex items-center gap-2">
        <Filter size={18} />
        <h3 className="font-semibold text-white">Filter Alerts</h3>
      </div>

      {/* Risk Type Filter Section */}
      <div>
        <h4 className="text-sm font-semibold text-secondary mb-2">Risk Type</h4>
        <div className="space-y-1 text-sm">
          {riskTypes.map(type => (
            <label key={type} className="flex items-center gap-2 p-1 rounded text-slate-300 cursor-pointer hover:bg-surface">
              <input 
                type="checkbox"
                checked={filters.types.includes(type)}
                onChange={() => handleTypeToggle(type)}
                className="h-4 w-4 rounded bg-background border-border text-primary focus:ring-primary/50"
              />
              <span>{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Priority Filter Section */}
      <div>
        <h4 className="text-sm font-semibold text-secondary mb-2">Priority</h4>
        <div className="flex flex-wrap gap-2">
            {priorities.map(priority => (
                <button 
                    key={priority}
                    onClick={() => handlePriorityToggle(priority)}
                    className={`px-2 py-1 text-xs font-semibold rounded-md border transition-colors ${
                        filters.priorities.includes(priority) 
                            ? 'bg-primary/80 text-white border-primary'
                            : 'bg-surface text-secondary border-border hover:border-secondary'
                    }`}
                >
                    {priority}
                </button>
            ))}
        </div>
      </div>
    </div>
  );
};

export default AlertsFilterSidebar;
