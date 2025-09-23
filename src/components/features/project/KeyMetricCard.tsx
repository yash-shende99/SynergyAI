import { FC } from 'react';

interface KeyMetricCardProps {
  title: string;
  value: string;
  status: string;
  color: string; // Tailwind text color class
}

const KeyMetricCard: FC<KeyMetricCardProps> = ({ title, value, status, color }) => (
  <div className="p-4 rounded-lg bg-surface/80 border border-border/50">
    <p className="text-sm text-secondary">{title}</p>
    <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
    <p className="text-xs text-slate-500 mt-1">{status}</p>
  </div>
);

export default KeyMetricCard;
