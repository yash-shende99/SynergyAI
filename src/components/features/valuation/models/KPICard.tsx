import { FC } from 'react';

interface KPICardProps {
  label: string;
  value: string;
}

const KPICard: FC<KPICardProps> = ({ label, value }) => {
  return (
    <div className="p-3 rounded-lg bg-background/50 border border-border">
      <p className="text-xs text-secondary truncate">{label}</p>
      <p className="text-xl font-bold text-white">{value}</p>
    </div>
  );
};

export default KPICard;