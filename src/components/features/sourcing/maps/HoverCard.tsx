import { FC } from 'react';
import { CompanyMapProfile } from '../../../../types';

const HoverCard: FC<{ company: CompanyMapProfile }> = ({ company }) => (
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 rounded-lg bg-surface border border-primary/50 shadow-2xl z-10 pointer-events-none">
        <p className="font-bold text-white text-sm truncate">{company.name}</p>
        <div className="space-y-1 text-xs mt-1">
            <div className="flex justify-between"><span className="text-secondary">Revenue:</span> <span className="font-medium text-white">₹{company.revenue.toLocaleString('en-IN')} Cr</span></div>
            <div className="flex justify-between"><span className="text-secondary">Growth:</span> <span className="font-medium text-green-400">{company.growth}%</span></div>
        </div>
    </div>
);
export default HoverCard;

