import { FC } from 'react';
import { Draft } from '../../../../types';
import StatusBadge from '../drafts/StatusBadge';

interface ReportSelectionPanelProps {
  drafts: Draft[];
  selectedReportIds: string[];
  setSelectedReportIds: (ids: string[]) => void;
}

const ReportSelectionPanel: FC<ReportSelectionPanelProps> = ({ drafts, selectedReportIds, setSelectedReportIds }) => {
  const handleToggle = (id: string) => {
    if (selectedReportIds.includes(id)) {
      setSelectedReportIds(selectedReportIds.filter(i => i !== id));
    } else {
      setSelectedReportIds([...selectedReportIds, id]);
    }
  };

  return (
    <div className="p-6 rounded-xl border border-border bg-surface/50">
      <h3 className="font-bold text-white text-lg">Step 1: Select Reports to Export</h3>
      <div className="mt-4 space-y-2 max-h-64 overflow-y-auto pr-2">
        {drafts.map(draft => (
          <label key={draft.id} className="flex items-center gap-4 p-3 rounded-lg bg-background/50 hover:bg-surface/50 cursor-pointer">
            <input 
              type="checkbox"
              checked={selectedReportIds.includes(draft.id)}
              onChange={() => handleToggle(draft.id)}
              className="h-5 w-5 rounded bg-surface border-border text-primary focus:ring-primary"
            />
            <div className="flex-1">
              <p className="font-medium text-white">{draft.title}</p>
              <p className="text-xs text-secondary">Last updated: {draft.lastModified}</p>
            </div>
            <StatusBadge status={draft.status}/>
          </label>
        ))}
      </div>
    </div>
  );
};

export default ReportSelectionPanel;