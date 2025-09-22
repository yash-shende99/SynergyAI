import { Info } from 'lucide-react';

const SynergyGaugeWidget = () => {
  const score = 72; // Mock score
  return (
    <div className="p-6 rounded-xl border border-border bg-surface/80 backdrop-blur-sm">
      <div className="flex justify-between items-start">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          Synergy Score
          <Info size={16} className="text-secondary cursor-pointer" />
        </h2>
        <div className="text-right">
          <p className="text-sm text-secondary">Total Value Creation</p>
          <p className="text-lg font-semibold text-white">$55M – $70M</p>
        </div>
      </div>
      <div className="flex items-center justify-center my-4">
        {/* Placeholder for Speedometer Gauge */}
        <div className="w-48 h-24 bg-background/50 rounded-t-full border-t-8 border-l-8 border-r-8 border-green-500 flex items-end justify-center relative">
           <div className="absolute bottom-0 text-4xl font-bold text-white">{score}</div>
           <div className="text-sm font-semibold text-green-400 mb-2">High Potential</div>
        </div>
      </div>
      <div className="text-center text-sm">
          <p className="text-secondary">Cost vs Revenue Split</p>
          <p className="font-semibold text-white"><span className="text-blue-400">40%</span> | <span className="text-green-400">60%</span></p>
      </div>
    </div>
  );
};

export default SynergyGaugeWidget;