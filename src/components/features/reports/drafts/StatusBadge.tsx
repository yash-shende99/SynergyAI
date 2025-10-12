import { FC } from 'react';

interface StatusBadgeProps {
  status: 'Draft' | 'In Review' | 'Published' | 'Archived';
}

const statusColors = {
  Draft: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  'In Review': 'bg-blue-500/20 text-blue-300 border-blue-500/30', 
  Published: 'bg-green-500/20 text-green-300 border-green-500/30',
  Archived: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
};

const StatusBadge: FC<StatusBadgeProps> = ({ status }) => (
  <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${statusColors[status]}`}>
    {status}
  </span>
);

export default StatusBadge;