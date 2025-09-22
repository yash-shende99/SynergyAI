'use client';

import { FC } from 'react';
import ReactECharts from 'echarts-for-react';

interface ChartProps {
  title: string;
  data: { name: string; value: number }[];
}

const DealDistributionChart: FC<ChartProps> = ({ title, data }) => {
  const option = {
    tooltip: { trigger: 'item' },
    legend: { show: false },
    series: [{
      name: title,
      type: 'pie',
      radius: ['40%', '65%'],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 8, borderColor: '#111111', borderWidth: 2 },
      label: { show: true, formatter: '{b}\n({d}%)', color: '#9CA3AF', overflow: 'truncate',
        ellipsis: '...' },
      emphasis: { label: { show: true, fontSize: '16', fontWeight: 'bold' } },
      data: data,
    }],
    color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
  };

  return (
    <div className="p-4 bg-surface/80 border border-border rounded-xl backdrop-blur-sm">
      <h4 className="text-sm font-bold text-white mb-2">{title}</h4>
      <div className="h-48">
        <ReactECharts option={option} style={{ height: '100%' }} theme="dark" />
      </div>
    </div>
  );
};
export default DealDistributionChart;