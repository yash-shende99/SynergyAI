import { FC } from 'react';

const getColor = (s: number) => {
  if (s > 75) return 'stroke-green-500 text-green-400';
  if (s > 50) return 'stroke-amber-500 text-amber-400';
  return 'stroke-red-500 text-red-400';
};

const SynergyGauge: FC<{ score: number }> = ({ score }) => {
  const colorClasses = getColor(score);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className={`relative w-48 h-48 mx-auto mt-4 ${colorClasses}`}>
      <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle className="stroke-current text-border" strokeWidth="8" fill="transparent" r="45" cx="50" cy="50" />
          <circle className="stroke-current transition-all duration-1000 ease-out" strokeWidth="8" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" fill="transparent" r="45" cx="50" cy="50" style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center font-bold text-6xl">{score}</div>
    </div>
  );
};
export default SynergyGauge;