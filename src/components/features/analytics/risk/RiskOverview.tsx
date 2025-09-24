import { FC } from 'react';
import { TargetCompanyRiskProfile } from '../../../../types';
import DetailedRiskRadial from './DetailedRiskRadial';

const getColor = (s: number) => {
  if (s > 70) return { text: 'text-red-400', stroke: 'stroke-red-500' };
  if (s > 40) return { text: 'text-amber-400', stroke: 'stroke-amber-500' };
  return { text: 'text-green-400', stroke: 'stroke-green-500' };
};

const RiskOverview: FC<{ riskProfile: TargetCompanyRiskProfile }> = ({ riskProfile }) => {
  const score = riskProfile.overallScore;
  const colors = getColor(score);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="p-6 rounded-xl border border-border bg-surface/50 h-full">
      <h3 className="font-bold text-white text-center mb-4">Overall Risk Score</h3>
      <div className="relative w-40 h-40 mx-auto">
        <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle className="stroke-current text-border" strokeWidth="8" fill="transparent" r="45" cx="50" cy="50" />
            <circle className={`stroke-current ${colors.stroke}`} strokeWidth="8" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" fill="transparent" r="45" cx="50" cy="50" style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }} />
        </svg>
        <div className={`absolute inset-0 flex items-center justify-center font-bold text-5xl ${colors.text}`}>{score}</div>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-6">
        {riskProfile.detailedBreakdown.slice(0, 4).map(risk => (
            <div key={risk.category} className="p-2 rounded bg-background/50 text-center">
                <p className="text-xs text-secondary">{risk.category}</p>
                <p className={`font-bold ${getColor(risk.score).text}`}>{risk.score}</p>
            </div>
        ))}
      </div>
    </div>
  );
};

export default RiskOverview;