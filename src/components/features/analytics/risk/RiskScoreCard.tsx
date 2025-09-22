import { FC } from 'react';
import { ShieldAlert, Bot } from 'lucide-react';
import { TargetCompanyRiskProfile } from '../../../../types';
import DetailedRiskRadial from './DetailedRiskRadial';

interface RiskScoreCardProps {
  company: TargetCompanyRiskProfile;
  isExpanded: boolean;
  onClick: () => void;
}

const getColor = (s: number) => {
  if (s > 70) return { text: 'text-red-400', stroke: 'stroke-red-500' };
  if (s > 40) return { text: 'text-amber-400', stroke: 'stroke-amber-500' };
  return { text: 'text-green-400', stroke: 'stroke-green-500' };
};

const RiskScoreCard: FC<RiskScoreCardProps> = ({ company, isExpanded, onClick }) => {
  const score = company.overallScore;
  const circumference = 2 * Math.PI * 28;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const colors = getColor(score);

  return (
    <div 
      onClick={onClick}
      className={`group p-6 rounded-2xl border bg-surface/50 backdrop-blur-lg text-left transition-all duration-500 cursor-pointer 
      ${isExpanded ? 'lg:col-span-2 border-primary ring-2 ring-primary/50' : 'border-border hover:border-secondary'}`}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-white">{company.name}</h3>
        {!isExpanded && (
          <div className="relative w-16 h-16 flex-shrink-0">
            <svg className="w-full h-full" viewBox="0 0 64 64">
              {/* --- BUG FIX #1: Corrected Border Color --- */}
              {/* This circle now correctly uses the dark 'text-border' color always */}
              <circle className="stroke-current text-border" strokeWidth="6" fill="transparent" r="28" cx="32" cy="32" />
              <circle 
                className={`stroke-current ${colors.stroke}`} 
                strokeWidth="6" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} 
                strokeLinecap="round" fill="transparent" r="28" cx="32" cy="32" 
                style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }} 
              />
            </svg>
            <div className={`absolute inset-0 flex items-center justify-center font-bold text-2xl ${colors.text}`}>{score}</div>
          </div>
        )}
      </div>

      {/* --- BUG FIX #2: Internal AI Insights on Hover --- */}
      {/* This section now appears INSIDE the card, only on hover, and only when the card is NOT expanded */}
      {!isExpanded && (
        <div className="transition-all duration-300 ease-in-out max-h-0 opacity-0 group-hover:max-h-40 group-hover:opacity-100 group-hover:mt-4 overflow-hidden">
          <div className="flex items-center gap-2 mb-2">
            <Bot size={16} className="text-primary"/>
            <h4 className="text-xs font-bold text-white">AI Insight: Top Risks</h4>
          </div>
          <ul className="text-xs text-secondary list-disc list-inside space-y-1">
            {company.topRisks.map((risk, i) => <li key={i}>{risk}</li>)}
          </ul>
        </div>
      )}

      {/* DETAILED EXPANDED VIEW - Renders only when isExpanded is true */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left side: Detailed Breakdown */}
            <div className="md:col-span-8">
                <h4 className="text-sm font-semibold text-secondary mb-4">Risk Category Breakdown</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-4">
                    {company.detailedBreakdown.map(risk => <DetailedRiskRadial key={risk.category} risk={risk} />)}
                </div>
            </div>
            {/* Right side: Overall Score */}
            <div className="md:col-span-4">
                <h4 className="text-sm font-semibold text-secondary mb-4 text-center">Overall Score</h4>
                <div className="relative w-32 h-32 mx-auto">
                    <svg className="w-full h-full" viewBox="0 0 64 64">
                        <circle className="stroke-current text-border" strokeWidth="6" fill="transparent" r="28" cx="32" cy="32" />
                        <circle className={`stroke-current ${colors.stroke}`} strokeWidth="6" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" fill="transparent" r="28" cx="32" cy="32" style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }} />
                    </svg>
                    <div className={`absolute inset-0 flex items-center justify-center font-bold text-4xl ${colors.text}`}>{score}</div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default RiskScoreCard;