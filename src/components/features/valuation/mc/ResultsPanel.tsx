// components/features/valuation/mc/ResultsPanel.tsx
import { FC } from 'react';
import { MonteCarloResult } from '../../../../types';
import SummaryStatsCard from './SummaryStatsCard';
import ProbabilityChart from './ProbabilityChart';
import { Loader2 } from 'lucide-react';

interface ResultsPanelProps {
  results: MonteCarloResult | null;
  isSimulating: boolean;
  error: string;
}

const ResultsPanel: FC<ResultsPanelProps> = ({ results, isSimulating, error }) => {
  if (isSimulating) {
    return (
      <div className="p-4 rounded-xl border border-border bg-surface/50 h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-secondary">Running Monte Carlo simulation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-xl border border-border bg-surface/50 h-full flex items-center justify-center">
        <div className="text-center text-red-400">
          <p className="font-semibold">Simulation Error</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="p-4 rounded-xl border border-border bg-surface/50 h-full flex items-center justify-center">
        <p className="text-secondary">Run a simulation to see the results.</p>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl border border-border bg-surface/50 h-full flex flex-col">
      <h3 className="font-semibold text-white mb-4">Simulation Results</h3>
      
      {/* AI Rationale Section */}
      {results.aiRationale && (
        <div className="mb-6 p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg">
          <h4 className="font-semibold text-blue-300 mb-2">AI Analysis</h4>
          <p className="text-sm text-white/80">{results.aiRationale}</p>
        </div>
      )}

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SummaryStatsCard 
          label="Mean Valuation" 
          value={`₹${results.meanValuation.toFixed(2)} Cr`} 
        />
        <SummaryStatsCard 
          label="Median Valuation" 
          value={`₹${results.medianValuation.toFixed(2)} Cr`} 
        />
        <SummaryStatsCard 
          label="Std. Deviation" 
          value={`₹${results.stdDeviation.toFixed(2)} Cr`} 
        />
        <SummaryStatsCard 
          label="90% Confidence" 
          value={`₹${results.confidenceInterval90[0].toFixed(2)} - ₹${results.confidenceInterval90[1].toFixed(2)} Cr`} 
        />
      </div>

      {/* Distribution Chart */}
      <div className="flex-1 min-h-[400px]">
        <ProbabilityChart data={results.distribution} />
      </div>
    </div>
  );
};

export default ResultsPanel;