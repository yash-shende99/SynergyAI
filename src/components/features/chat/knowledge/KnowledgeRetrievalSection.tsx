'use client';

import { useState } from 'react';
import KnowledgeFilterSidebar from './KnowledgeFilterSidebar';
import KnowledgeResultsPanel from './KnowledgeResultsPanel';
import GraphModal from './GraphModal';

export default function KnowledgeRetrievalSection() {
  // --- FIX STARTS HERE ---

  // 1. Re-introduce the state to manage the active filter.
  const [activeFilter, setActiveFilter] = useState('All Sources');

  // 2. Re-introduce the state to manage the graph modal visibility.
  const [isGraphVisible, setIsGraphVisible] = useState(false);
  
  // --- FIX ENDS HERE ---

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
        {/* Left Panel: Filter Sidebar */}
        <div className="lg:col-span-1">
          {/* 3. Pass the necessary props down to the sidebar component. */}
          <KnowledgeFilterSidebar 
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
          />
        </div>

        {/* Right Panel: Search Bar and Results */}
        <div className="lg:col-span-3">
          <KnowledgeResultsPanel onVisualizeClick={() => setIsGraphVisible(true)} />
        </div>
      </div>

      {/* The modal logic remains the same */}
      <GraphModal 
        isOpen={isGraphVisible} 
        onClose={() => setIsGraphVisible(false)} 
      />
    </>
  );
}