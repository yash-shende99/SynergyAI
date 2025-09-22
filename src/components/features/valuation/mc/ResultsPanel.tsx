import { FC } from 'react';
import SummaryStatsCard from './SummaryStatsCard';
import ProbabilityChart from './ProbabilityChart';

interface ResultsPanelProps {
  simState: 'idle' | 'running' | 'complete';
}

const ResultsPanel: FC<ResultsPanelProps> = ({ simState }) => {
  if (simState !== 'complete') {
    return (
      <div className="p-4 rounded-xl border border-border bg-surface/50 h-full flex items-center justify-center">
        <p className="text-secondary">Run a simulation to see the results.</p>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl border border-border bg-surface/50 h-full flex flex-col">
      <h3 className="font-semibold text-white mb-4">Simulation Results</h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <SummaryStatsCard label="Mean Valuation" value="$1.25B" />
        <SummaryStatsCard label="Median Valuation" value="$1.21B" />
        <SummaryStatsCard label="Std. Deviation" value="$150M" />
        <SummaryStatsCard label="90% Confidence" value="$1.0B - $1.5B" />
      </div>
      <div className="flex-1">
        <ProbabilityChart />
      </div>
    </div>
  );
};

export default ResultsPanel;