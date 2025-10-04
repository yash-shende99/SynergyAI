// components/features/valuation/mc/ProbabilityChart.tsx
'use client';

import { FC, useEffect, useRef } from 'react';
import * as echarts from 'echarts';

interface ProbabilityChartProps {
  data?: number[];
}

const ProbabilityChart: FC<ProbabilityChartProps> = ({ data }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current || !data || data.length === 0) return;

    const chart = echarts.init(chartRef.current);
    
    // Calculate histogram data
    const min = Math.min(...data);
    const max = Math.max(...data);
    const binCount = 50;
    const binSize = (max - min) / binCount;
    
    const bins = Array(binCount).fill(0);
    data.forEach(value => {
      const binIndex = Math.min(Math.floor((value - min) / binSize), binCount - 1);
      bins[binIndex]++;
    });

    const xAxisData = bins.map((_, index) => 
      (min + (index * binSize)).toFixed(2)
    );

    const option = {
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const value = params[0];
          return `Valuation: ₹${value.name} Cr<br>Frequency: ${value.value}`;
        }
      },
      xAxis: {
        type: 'category',
        data: xAxisData,
        name: 'Valuation (₹ Cr)',
        nameLocation: 'middle',
        nameGap: 30,
        axisLabel: {
          rotate: 45,
          formatter: (value: string) => `₹${parseFloat(value).toFixed(0)}`
        }
      },
      yAxis: {
        type: 'value',
        name: 'Frequency',
        nameLocation: 'middle',
        nameGap: 30
      },
      series: [
        {
          data: bins,
          type: 'bar',
          itemStyle: {
            color: '#3b82f6'
          },
          emphasis: {
            itemStyle: {
              color: '#1d4ed8'
            }
          }
        }
      ],
      grid: {
        left: '60',
        right: '20',
        bottom: '80',
        top: '20'
      }
    };

    chart.setOption(option);

    // Handle resize
    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-full bg-background/50 rounded-lg flex items-center justify-center p-4 border border-border">
        <div className="text-center text-secondary">
          <p className="font-semibold">No data available</p>
          <p className="text-sm mt-2">Run a simulation to see the distribution</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <div ref={chartRef} className="w-full h-full" />
    </div>
  );
};

export default ProbabilityChart;