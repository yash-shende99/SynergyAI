import { FC } from 'react';
import { Company } from '../../../../types';

const CompanySummaryCard: FC<{company: Company, label: string}> = ({company, label}) => (
    <div className="p-3 rounded-lg bg-background/50 border border-border/50">
        <p className="text-xs text-secondary">{label}</p>
        <p className="font-bold text-white truncate">{company.name}</p>
        <p className="text-xs text-slate-400">{company.sector}</p>
    </div>
);
export default CompanySummaryCard;