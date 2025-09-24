'use client';

import { useState } from 'react';
import { KnowledgeGraphData, GraphNode } from '../../../../types';
import InteractiveGraph from './InteractiveGraph';
import GraphSidebar from './GraphSidebar';

const KnowledgeGraphSection: React.FC<{ graphData: KnowledgeGraphData }> = ({ graphData }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  return (
    <div className="flex h-[80vh] gap-6">
      <div className="flex-1 relative">
        <InteractiveGraph 
          graphData={graphData} 
          onNodeClick={(node) => setSelectedNode(node)} 
        />
      </div>
      <GraphSidebar 
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        selectedNode={selectedNode}
      />
    </div>
  );
};
export default KnowledgeGraphSection;