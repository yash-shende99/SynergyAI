import { FC } from 'react';
import { TargetCompanyRiskProfile } from '../../../../types';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

const TopRisksPanel: FC<{ topRisks: TargetCompanyRiskProfile['topRisks'] }> = ({ topRisks }) => (
    <div className="p-6 rounded-xl border border-border bg-surface/50 h-full">
        <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="h-6 w-6 text-primary"/>
            <h3 className="text-lg font-bold text-white">Top 3 Critical Risks & Mitigations</h3>
        </div>
        <div className="space-y-4">
            {topRisks.map((item, index) => (
                <div key={index} className="p-4 rounded-lg bg-background/50 border border-border/50">
                    <div className="flex items-start gap-3">
                        <AlertTriangle size={16} className="text-amber-400 mt-1 flex-shrink-0"/>
                        <div>
                            <h4 className="font-semibold text-white">Risk Identified</h4>
                            <p className="text-sm text-secondary">{item.risk}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 mt-3 pt-3 border-t border-border/50">
                        <ShieldCheck size={16} className="text-green-400 mt-1 flex-shrink-0"/>
                        <div>
                            <h4 className="font-semibold text-white">AI-Suggested Mitigation</h4>
                            <p className="text-sm text-secondary">{item.mitigation}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export default TopRisksPanel;