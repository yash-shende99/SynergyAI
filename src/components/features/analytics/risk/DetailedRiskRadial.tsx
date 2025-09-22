import { FC } from 'react';
import { RiskItem } from '../../../../types';

const getColor = (s: number) => {
  if (s > 70) return { text: 'text-red-400', stroke: 'stroke-red-500' };
  if (s > 40) return { text: 'text-amber-400', stroke: 'stroke-amber-500' };
  return { text: 'text-green-400', stroke: 'stroke-green-500' };
};

const DetailedRiskRadial: FC<{ risk: RiskItem }> = ({ risk }) => {
  const circumference = 2 * Math.PI * 20;
  const strokeDashoffset = circumference - (risk.score / 100) * circumference;
  const colors = getColor(risk.score);

  return (
    <div className="p-4 rounded-lg bg-background/50 border border-border">
      <h4 className={`font-bold text-center text-sm ${colors.text}`}>{risk.category} Risk</h4>
      <div className="relative w-20 h-20 mx-auto my-2">
        <svg className="w-full h-full" viewBox="0 0 48 48">
          <circle className="stroke-current text-border/50" strokeWidth="4" fill="transparent" r="20" cx="24" cy="24" />
          <circle
            className={`stroke-current ${colors.stroke} transition-all duration-1000`}
            strokeWidth="4" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
            strokeLinecap="round" fill="transparent" r="20" cx="24" cy="24"
            style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
          />
        </svg>
        <div className={`absolute inset-0 flex items-center justify-center font-bold text-xl ${colors.text}`}>
          {risk.score}
        </div>
      </div>
      <ul className="text-xs text-secondary list-disc list-inside space-y-1">
        {risk.insights.map((insight, index) => <li key={index}>{insight}</li>)}
      </ul>
    </div>
  );
};

export default DetailedRiskRadial;