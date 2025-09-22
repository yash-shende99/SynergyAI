import { FC } from 'react';
import ReactECharts from 'echarts-for-react';
import { Project, DealStatus } from '../../../types';

const DealFunnelVisualization: FC<{ projects: Project[] }> = ({ projects }) => {
  
  // --- THIS IS THE FIX ---
  // We provide an explicit type for our accumulator and a default value for each status.
  // This tells TypeScript the exact shape of our 'statusCounts' object.
  const statusCounts = projects.reduce((acc: Record<DealStatus, number>, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, { 'Sourcing': 0, 'Diligence': 0, 'Negotiation': 0, 'Completed': 0 }); // The initial value is key

  const option = {
    tooltip: { trigger: 'item', formatter: '{a} <br/>{b} : {c}' },
    series: [{
      name: 'Deal Funnel', type: 'funnel',
      data: [
        {value: statusCounts['Sourcing'], name: 'Sourcing'},
        {value: statusCounts['Diligence'], name: 'Diligence'},
        {value: statusCounts['Negotiation'], name: 'Negotiation'},
        {value: statusCounts['Completed'], name: 'Completed'},
      ]
    }]
  };
  return (
    <div className="p-6 bg-surface/80 border border-border rounded-xl backdrop-blur-sm">
      <h3 className="text-lg font-bold text-white mb-4">Pipeline Funnel</h3>
      <div className="h-48"><ReactECharts option={option} style={{height: '100%'}}/></div>
    </div>
  );
};
export default DealFunnelVisualization;