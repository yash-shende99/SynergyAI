// components/features/valuation/scenarios/ScenarioChart.tsx
'use client';

import { FC, useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { Scenario } from '../../../../types';

interface ScenarioChartProps {
  scenario: Scenario;
}

const ScenarioChart: FC<ScenarioChartProps> = ({ scenario }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = echarts.init(chartRef.current);
    
    // Mock base case data - in a real app, this would come from your base model
    const baseCase = {
      revenue: 1000, // Base revenue in Cr
      cogs: 600,    // Base COGS in Cr
      grossProfit: 400,
      ebitda: 300,
      netIncome: 200
    };

    // Calculate scenario impacts
    const scenarioRevenue = baseCase.revenue * (1 + scenario.variables.revenueChange / 100);
    const scenarioCogs = baseCase.cogs * (1 + scenario.variables.cogsChange / 100);
    const scenarioGrossProfit = scenarioRevenue - scenarioCogs;
    const scenarioEbitda = scenarioGrossProfit * 0.75; // Simplified calculation
    const scenarioNetIncome = scenarioEbitda * (1 - scenario.variables.taxRate / 100);

    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: (params: any) => {
          const baseValue = params[0].value;
          const scenarioValue = params[1].value;
          const change = ((scenarioValue - baseValue) / baseValue * 100).toFixed(1);
          return `
            ${params[0].name}<br/>
            Base: ₹${baseValue.toFixed(1)} Cr<br/>
            ${scenario.name}: ₹${scenarioValue.toFixed(1)} Cr<br/>
            Change: ${change}%
          `;
        }
      },
      legend: {
        data: ['Base Case', scenario.name],
        textStyle: {
          color: '#94a3b8'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: ['Revenue', 'COGS', 'Gross Profit', 'EBITDA', 'Net Income'],
        axisLabel: {
          color: '#94a3b8'
        },
        axisLine: {
          lineStyle: {
            color: '#475569'
          }
        }
      },
      yAxis: {
        type: 'value',
        name: '₹ Cr',
        nameTextStyle: {
          color: '#94a3b8'
        },
        axisLabel: {
          color: '#94a3b8',
          formatter: '₹{value}'
        },
        axisLine: {
          lineStyle: {
            color: '#475569'
          }
        },
        splitLine: {
          lineStyle: {
            color: '#334155',
            type: 'dashed'
          }
        }
      },
      series: [
        {
          name: 'Base Case',
          type: 'bar',
          data: [baseCase.revenue, baseCase.cogs, baseCase.grossProfit, baseCase.ebitda, baseCase.netIncome],
          itemStyle: {
            color: '#475569'
          },
          emphasis: {
            itemStyle: {
              color: '#64748b'
            }
          }
        },
        {
          name: scenario.name,
          type: 'bar',
          data: [scenarioRevenue, scenarioCogs, scenarioGrossProfit, scenarioEbitda, scenarioNetIncome],
          itemStyle: {
            color: '#3b82f6'
          },
          emphasis: {
            itemStyle: {
              color: '#1d4ed8'
            }
          }
        }
      ]
    };

    chart.setOption(option);

    // Handle resize
    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, [scenario]);

  return (
    <div ref={chartRef} className="w-full h-full" />
  );
};

export default ScenarioChart;