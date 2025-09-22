import { FC } from 'react';
import { BarChart2, Expand } from 'lucide-react';


interface LivePreviewChartProps {
  onExpand: () => void;
}

const LivePreviewChart: FC<LivePreviewChartProps> = ({ onExpand }) => {
  return (
    <button onClick={onExpand} className="w-full p-4 rounded-xl border border-border bg-surface/50 text-left group transition-all duration-300 hover:border-primary/50 hover:bg-surface/80">
      <div className="flex justify-between items-center">
        <h4 className="font-bold text-white text-sm">Live Preview Chart</h4>
        <Expand size={16} className="text-secondary transition-transform group-hover:scale-110"/>
      </div>
      <div className="mt-2 flex items-center justify-center h-32 bg-background/50 rounded-lg">
        <div className="text-center text-secondary">
          <BarChart2 size={32} className="mx-auto mb-2 opacity-50"/>
          <p className="text-xs">[Small ECharts Preview]</p>
        </div>
      </div>
    </button>
  );
};

export default LivePreviewChart;