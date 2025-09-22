import { FC } from 'react';
import { DraftStatus } from '../../../../types';

const statusColors: Record<DraftStatus, string> = {
  Draft: 'bg-gray-500/30 text-gray-300 border-gray-500/50',
  Review: 'bg-amber-500/30 text-amber-300 border-amber-500/50',
  Final: 'bg-green-500/30 text-green-300 border-green-500/50',
};

const StatusBadge: FC<{ status: DraftStatus }> = ({ status }) => (
  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${statusColors[status]}`}>
    {status}
  </span>
);

export default StatusBadge;