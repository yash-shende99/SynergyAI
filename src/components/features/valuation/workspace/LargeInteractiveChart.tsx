import { BarChartBig } from 'lucide-react';

const LargeInteractiveChart = () => {
  return (
    <div className="w-full h-full bg-background/50 rounded-lg border border-border flex items-center justify-center p-4">
      <div className="text-center text-secondary">
        <BarChartBig size={64} className="mx-auto mb-4 opacity-30"/>
        <p className="font-semibold text-lg">[Large, Interactive ECharts/D3.js Visualization]</p>
        <p className="text-sm">With zoom, pan, and toggleable series (e.g., Revenue, EBITDA).</p>
      </div>
    </div>
  );
};

export default LargeInteractiveChart;