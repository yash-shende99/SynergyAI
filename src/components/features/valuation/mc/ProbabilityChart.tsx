import { AreaChart } from 'lucide-react';

const ProbabilityChart = () => (
  <div className="w-full h-full bg-background/50 rounded-lg flex items-center justify-center p-4 border border-border">
    <div className="text-center text-secondary">
      <AreaChart size={48} className="mx-auto mb-2 opacity-50"/>
      <p className="font-semibold">[ECharts Probability Distribution Curve]</p>
    </div>
  </div>
);
export default ProbabilityChart;