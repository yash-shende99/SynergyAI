'use client';

import { useState } from 'react';
import SearchInputPanel from './SearchInputPanel';
import SearchResultsPanel from './SearchResultsPanel';
import DocumentPreviewPanel from './DocumentPreviewPanel';
import { VdrSearchResult } from '../../../../types';

export default function SearchSection() {
  const [selectedResult, setSelectedResult] = useState<VdrSearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSearch = (query: string) => {
    setIsLoading(true);
    console.log("Searching for:", query);
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      {/* Left Panel: Search Input and Results */}
      <div className="flex flex-col gap-6">
        <SearchInputPanel onSearch={handleSearch} isLoading={isLoading} />
        <SearchResultsPanel 
          results={[]} 
          isLoading={isLoading} 
          error="" 
          onResultSelect={setSelectedResult} 
        />
      </div>

      {/* Right Panel: Full Document Preview */}
      <div>
        <DocumentPreviewPanel selectedResult={selectedResult} />
      </div>
    </div>
  );
}