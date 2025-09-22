'use client';

import { FC } from 'react';
import KPICard from './KPICard';
import { BarChartHorizontal, Expand } from 'lucide-react';
import { ModelRow } from '../../../../types'; // <-- 1. Import the ModelRow type

// --- THIS IS THE FIX ---
// 2. Define the props interface that the component expects to receive.
interface VisualizationPanelProps {
  modelData: ModelRow[];
  onChartExpand: () => void;
}

const VisualizationPanel: FC<VisualizationPanelProps> = ({ modelData, onChartExpand }) => {
  // 3. Use the modelData prop to perform real-time calculations.
  const revenueRow = modelData.find(r => r.id === 'rev');
  const ebitdaRow = modelData.find(r => r.id === 'ebitda');

  const revenue2027 = revenueRow?.values[3] || 0;
  const ebitda2027 = ebitdaRow?.values[3] || 0;
  const ebitdaMargin = revenue2027 > 0 ? ((ebitda2027 / revenue2027) * 100).toFixed(1) + '%' : 'N/A';

  return (
    <div className="p-4 rounded-xl border border-border bg-surface/50">
      <h3 className="font-bold text-white mb-4">Visualizations</h3>
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* The KPIs are now dynamic and will update in real-time */}
        <KPICard label="Revenue (2027E)" value={`₹${revenue2027.toLocaleString('en-IN')} Cr`} />
        <KPICard label="EBITDA Margin (2027E)" value={ebitdaMargin} />
      </div>
      
      {/* 4. The chart is now a button that uses the onChartExpand function. */}
      <button onClick={onChartExpand} className="w-full text-left group">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold text-white text-sm">Revenue & EBITDA Trend</h4>
            <Expand size={16} className="text-secondary transition-transform group-hover:scale-110"/>
          </div>
          <div className="flex items-center justify-center h-40 bg-background/50 rounded-lg">
            <div className="text-center text-secondary">
              <BarChartHorizontal size={32} className="mx-auto mb-2 opacity-50"/>
              <p className="text-xs">[Click to Expand Chart]</p>
            </div>
          </div>
      </button>
    </div>
  );
};

export default VisualizationPanel;