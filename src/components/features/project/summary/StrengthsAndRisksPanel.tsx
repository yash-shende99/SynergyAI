import { FC } from 'react';
import { ThumbsUp, AlertTriangle } from 'lucide-react';

interface StrengthsAndRisksPanelProps {
    strengths: string[];
    risks: string[];
}

const StrengthsAndRisksPanel: FC<StrengthsAndRisksPanelProps> = ({ strengths, risks }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl border border-border bg-surface/50">
            <div className="flex items-center gap-3 mb-4">
                <ThumbsUp className="h-6 w-6 text-green-400"/>
                <h3 className="text-lg font-bold text-white">Key Strengths</h3>
            </div>
            <ul className="space-y-2 list-disc list-inside text-sm text-secondary">
                {strengths.map((item, index) => <li key={index}>{item}</li>)}
            </ul>
        </div>
        <div className="p-6 rounded-xl border border-border bg-surface/50">
            <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="h-6 w-6 text-amber-400"/>
                <h3 className="text-lg font-bold text-white">Key Risks & Considerations</h3>
            </div>
            <ul className="space-y-2 list-disc list-inside text-sm text-secondary">
                {risks.map((item, index) => <li key={index}>{item}</li>)}
            </ul>
        </div>
    </div>
);

export default StrengthsAndRisksPanel;
