import { FC } from 'react';

const SummaryStatsCard: FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="p-3 rounded-lg bg-background/50 border border-border">
    <p className="text-xs text-secondary truncate">{label}</p>
    <p className="text-lg font-bold text-white">{value}</p>
  </div>
);
export default SummaryStatsCard;