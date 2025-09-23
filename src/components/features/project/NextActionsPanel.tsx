import { ClipboardList } from 'lucide-react';

// Mock data for "Next Actions"
const mockActions = [
  { id: 1, text: 'Schedule review of Master Service Agreement with legal counsel.', isCompleted: false },
  { id: 2, text: 'Build detailed LBO model based on Q3 financials.', isCompleted: false },
  { id: 3, text: 'Finalize synergy estimate for supply chain consolidation.', isCompleted: true },
];

const NextActionsPanel = () => (
  <div className="p-6 rounded-xl border border-border bg-surface/50 h-full">
    <div className="flex items-center gap-3 mb-4">
        <ClipboardList className="h-6 w-6 text-primary"/>
        <h3 className="text-lg font-bold text-white">AI-Suggested Next Actions</h3>
    </div>
    <div className="space-y-2">
      {mockActions.map(action => (
        <label key={action.id} className="flex items-center gap-3 p-2 rounded hover:bg-surface/50">
          <input type="checkbox" defaultChecked={action.isCompleted} className="h-4 w-4 rounded bg-surface border-border text-primary"/>
          <span className={`text-sm ${action.isCompleted ? 'text-secondary line-through' : 'text-slate-300'}`}>
            {action.text}
          </span>
        </label>
      ))}
    </div>
  </div>
);

export default NextActionsPanel;
