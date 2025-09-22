'use client';

import { useState } from 'react';
import GraphCanvas from './GraphCanvas';
import GraphSidebar from './GraphSidebar';

export default function KnowledgeGraphSection() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  // In a real app, this would hold the data of the clicked node
  const [selectedNode, setSelectedNode] = useState({ type: 'Company', name: 'SolarTech Inc.' });

  return (
    <div className="flex h-[70vh] gap-6">
      {/* Main Graph Area */}
      <div className="flex-1">
        <GraphCanvas />
      </div>

      {/* Collapsible Right Sidebar */}
      <GraphSidebar 
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        selectedNode={selectedNode}
      />
    </div>
  );
}