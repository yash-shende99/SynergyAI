// components/features/project/RiskHealthPanel.tsx
import { FC } from 'react';
import { AlertTriangle, CheckCircle2, Clock, Target } from 'lucide-react';

interface RiskHealthPanelProps {
  riskScore: string;
  riskLevel: string;
  criticalEvents: number;
  dealComplexity: string;
  taskCompletion: string;
  milestoneProgress: string;
}

const RiskHealthPanel: FC<RiskHealthPanelProps> = ({
  riskScore,
  riskLevel,
  criticalEvents,
  dealComplexity,
  taskCompletion,
  milestoneProgress
}) => {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'High': return 'text-red-400';
      case 'Medium': return 'text-amber-400';
      case 'Low': return 'text-green-400';
      default: return 'text-slate-400';
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'High': return 'text-red-400';
      case 'Medium': return 'text-amber-400';
      case 'Low': return 'text-green-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="p-6 rounded-xl border border-border bg-surface/50 h-full">
      <div className="flex items-center gap-3 mb-4">
        <AlertTriangle className="h-6 w-6 text-primary"/>
        <h3 className="text-lg font-bold text-white">Deal Health</h3>
      </div>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-secondary">Risk Level</span>
          <span className={`font-semibold ${getRiskColor(riskLevel)}`}>
            {riskScore} • {riskLevel}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-secondary">Critical Events</span>
          <span className="text-white font-semibold">{criticalEvents} (90d)</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-secondary">Deal Complexity</span>
          <span className={`font-semibold ${getComplexityColor(dealComplexity)}`}>
            {dealComplexity}
          </span>
        </div>
        
        <div className="pt-3 border-t border-border space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-secondary flex items-center gap-2">
              <CheckCircle2 size={14} />
              Task Completion
            </span>
            <span className="text-white font-semibold">{taskCompletion}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-secondary flex items-center gap-2">
              <Target size={14} />
              Milestone Progress
            </span>
            <span className="text-white font-semibold">{milestoneProgress}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskHealthPanel;