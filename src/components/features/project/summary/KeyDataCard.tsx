import { FC } from 'react';
import { ProjectSummary } from '../../../../types';
import { DollarSign, Percent, Briefcase } from 'lucide-react';

const KeyDataCard: FC<{ data: ProjectSummary['keyData'] }> = ({ data }) => (
    <div className="p-6 rounded-xl border border-border bg-surface/50 h-full">
        <h3 className="text-lg font-bold text-white mb-4">Key Financials</h3>
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-500/10 rounded-lg"><DollarSign className="h-5 w-5 text-blue-400"/></div>
                <div>
                    <p className="text-sm text-secondary">Revenue (Cr)</p>
                    <p className="font-bold text-white text-xl">₹{data.revenue?.toLocaleString('en-IN')}</p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="p-2 bg-green-500/10 rounded-lg"><Percent className="h-5 w-5 text-green-400"/></div>
                <div>
                    <p className="text-sm text-secondary">EBITDA Margin</p>
                    <p className="font-bold text-white text-xl">{data.ebitdaMargin}%</p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="p-2 bg-purple-500/10 rounded-lg"><Briefcase className="h-5 w-5 text-purple-400"/></div>
                <div>
                    <p className="text-sm text-secondary">Return on Equity</p>
                    <p className="font-bold text-white text-xl">{data.roe}%</p>
                </div>
            </div>
        </div>
    </div>
);

export default KeyDataCard;
