import { FC } from 'react';

interface RiskScorecardProps {
  dealName: string;
  financialRisk: number;
  legalRisk: number;
  operationalRisk: number;
}

const RiskBar: FC<{ label: string, score: number }> = ({ label, score }) => {
  const getColor = (s: number) => s > 66 ? 'bg-red-500' : s > 33 ? 'bg-amber-500' : 'bg-green-500';
  return (
    <div>
      <div className="flex justify-between items-center text-xs mb-1">
        <span className="text-secondary">{label}</span>
        <span className="font-bold text-white">{score}/100</span>
      </div>
      <div className="w-full bg-background/50 rounded-full h-1.5">
        <div className={getColor(score)} style={{ width: `${score}%` }}></div>
      </div>
    </div>
  );
};

const RiskScorecard: FC<RiskScorecardProps> = ({ dealName, financialRisk, legalRisk, operationalRisk }) => {
  return (
    <div className="p-4 bg-surface/80 border border-border rounded-xl backdrop-blur-sm space-y-3">
      <h4 className="text-sm font-bold text-white truncate">{dealName}</h4>
      <RiskBar label="Financial Risk" score={financialRisk} />
      <RiskBar label="Legal Risk" score={legalRisk} />
      <RiskBar label="Operational Risk" score={operationalRisk} />
    </div>
  );
};

export default RiskScorecard;