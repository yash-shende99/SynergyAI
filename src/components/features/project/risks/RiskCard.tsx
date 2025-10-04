import { FC } from 'react';
import { KeyRisk } from '../../../../types';
import { ShieldCheck, FileText } from 'lucide-react';

const getSeverityColor = (severity: number) => {
  if (severity > 75) return 'bg-red-500/20 text-red-300 border-red-500/50';
  if (severity > 50) return 'bg-amber-500/20 text-amber-300 border-amber-500/50';
  return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
};

const RiskCard: FC<{ risk: KeyRisk }> = ({ risk }) => (
    <div className="p-6 rounded-xl border border-border bg-surface/50 h-full flex flex-col">
        <div className="flex justify-between items-start mb-2">
            <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getSeverityColor(risk.severity)}`}>
                {risk.category}
            </span>
            <div className="text-right">
                <p className="text-xs text-secondary">Severity</p>
                <p className={`font-bold text-lg ${getSeverityColor(risk.severity).replace('bg-', 'text-').split(' ')[0]}`}>{risk.severity} / 100</p>
            </div>
        </div>

        <p className="text-white font-semibold my-2 flex-grow">{risk.risk}</p>

        <div className="mt-4 pt-4 border-t border-border/50 space-y-3">
            <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-green-400 mb-1">
                    <ShieldCheck size={16}/>
                    <span>AI-Suggested Mitigation</span>
                </div>
                <p className="text-xs text-secondary">{risk.mitigation}</p>
            </div>
            {risk.evidence && risk.evidence.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-secondary mb-1">
                        <FileText size={16}/>
                        <span>Evidence from VDR</span>
                    </div>
                    <p className="text-xs text-slate-400 italic bg-background/50 p-2 rounded-md border border-border/50">"...{risk.evidence[0]}..."</p>
                </div>
            )}
        </div>
    </div>
);

export default RiskCard;
