'use client';

import { useState } from 'react';
import KnowledgeFilterSidebar from './KnowledgeFilterSidebar';
import KnowledgeResultsPanel from './KnowledgeResultsPanel';
import GraphModal from './GraphModal';

export default function KnowledgeRetrievalSection() {
  const [activeFilter, setActiveFilter] = useState('All Sources');
  const [companyFilter, setCompanyFilter] = useState('');
  const [dateRange, setDateRange] = useState('All Time');
  const [isGraphVisible, setIsGraphVisible] = useState(false);

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
        {/* Left Panel: Filter Sidebar */}
        <div className="lg:col-span-1">
          <KnowledgeFilterSidebar 
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            companyFilter={companyFilter}
            setCompanyFilter={setCompanyFilter}
            dateRange={dateRange}
            setDateRange={setDateRange}
          />
        </div>

        {/* Right Panel: Search Bar and Results */}
        <div className="lg:col-span-3">
          <KnowledgeResultsPanel 
            onVisualizeClick={() => setIsGraphVisible(true)}
            activeFilter={activeFilter}
            companyFilter={companyFilter}
            dateRange={dateRange}
          />
        </div>
      </div>

      <GraphModal 
        isOpen={isGraphVisible} 
        onClose={() => setIsGraphVisible(false)} 
      />
    </>
  );
}