'use client';

import { FC } from 'react';
import ReactECharts from 'echarts-for-react';
import { KnowledgeGraphData, GraphNode } from '../../../../types';

interface InteractiveGraphProps {
  graphData: KnowledgeGraphData;
  onNodeClick: (node: GraphNode) => void;
}

const InteractiveGraph: FC<InteractiveGraphProps> = ({ graphData, onNodeClick }) => {
  // Define distinct colors for each category
  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      'Target': '#3B82F6',     // Blue
      'Executive': '#10B981',  // Green
      'Competitor': '#EF4444', // Red
      'Subsidiary': '#8B5CF6', // Purple
      'Partner': '#F59E0B'     // Amber/Yellow
    };
    return colors[category] || '#6B7280';
  };

  // Prepare nodes with explicit styling
  const styledNodes = graphData.nodes.map(node => ({
    ...node,
    itemStyle: {
      color: getCategoryColor(node.category)
    },
    label: {
      show: true,
      position: 'right',
      color: '#fff',
      fontSize: 10,
      fontWeight: 'bold'
    }
  }));

  // Prepare categories for legend with colors
  const legendData = graphData.categories.map(category => ({
    name: category.name,
    itemStyle: {
      color: getCategoryColor(category.name)
    }
  }));

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        if (params.dataType === 'node') {
          const node = params.data;
          return `
            <div class="p-2 min-w-32">
              <div class="font-bold text-white mb-1">${node.name}</div>
              <div class="flex items-center gap-2 mb-1">
                <span style="color: ${getCategoryColor(node.category)}">●</span>
                <span class="text-gray-300">${node.category}</span>
              </div>
              ${node.value ? `<div class="text-gray-400 text-sm">${node.value}</div>` : ''}
            </div>
          `;
        }
        // For links (edges)
        return `
          <div class="p-2">
            <div class="text-gray-300">Connection</div>
            <div class="text-white">${params.data.source} → ${params.data.target}</div>
          </div>
        `;
      },
      backgroundColor: '#1F2937',
      borderColor: '#374151',
      textStyle: { color: '#F9FAFB' },
      extraCssText: 'box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5);'
    },
    legend: {
      data: legendData,
      textStyle: { 
        color: '#9CA3AF',
        fontSize: 12
      },
      itemStyle: {
        borderWidth: 0
      },
      itemGap: 15,
      top: 10,
      left: 'center'
    },
    animationDuration: 1500,
    animationEasingUpdate: 'quinticInOut',
    series: [{
      name: 'Company Relationships',
      type: 'graph',
      layout: 'force',
      data: styledNodes,
      links: graphData.links,
      categories: graphData.categories,
      roam: true,
      label: {
        show: true,
        position: 'right',
        formatter: '{b}',
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold'
      },
      lineStyle: {
        color: 'source',
        curveness: 0.1,
        width: 1.5,
        opacity: 0.6
      },
      emphasis: {
        focus: 'adjacency',
        lineStyle: {
          width: 3,
          opacity: 1
        }
      },
      force: {
        repulsion: 300,
        gravity: 0.1,
        edgeLength: 150
      }
    }]
  };

  const onEvents = {
    'click': (params: any) => {
      if (params.dataType === 'node') {
        onNodeClick(params.data as GraphNode);
      }
    }
  };

  return (
    <div className="w-full h-full bg-surface/50 rounded-xl border border-border">
      <ReactECharts 
        option={option} 
        style={{ height: '100%', width: '100%' }} 
        onEvents={onEvents}
        opts={{ renderer: 'canvas' }}
      />
    </div>
  );
};

export default InteractiveGraph;