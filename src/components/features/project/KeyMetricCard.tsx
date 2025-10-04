// components/features/project/KeyMetricCard.tsx
import { FC, ReactNode } from 'react';

interface KeyMetricCardProps {
  title: string;
  value: string;
  status: string;
  color: string;
  icon?: ReactNode;
}

const KeyMetricCard: FC<KeyMetricCardProps> = ({ title, value, status, color, icon }) => (
  <div className="p-4 rounded-lg bg-surface/80 border border-border/50 hover:border-primary/30 transition-colors">
    <div className="flex items-center justify-between mb-2">
      <p className="text-sm text-secondary">{title}</p>
      {icon && <div className={color}>{icon}</div>}
    </div>
    <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
    <p className="text-xs text-slate-500 mt-1">{status}</p>
  </div>
);

export default KeyMetricCard;