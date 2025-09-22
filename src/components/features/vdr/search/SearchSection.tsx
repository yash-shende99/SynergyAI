'use client';

import { useState } from 'react';
import SearchInputPanel from './SearchInputPanel';
import SearchResultsPanel from './SearchResultsPanel';
import DocumentPreviewPanel from './DocumentPreviewPanel';

export default function SearchSection() {
  const [selectedResult, setSelectedResult] = useState(null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      {/* Left Panel: Search Input and Results */}
      <div className="flex flex-col gap-6">
        <SearchInputPanel />
        <SearchResultsPanel onResultSelect={setSelectedResult} />
      </div>

      {/* Right Panel: Full Document Preview */}
      <div>
        <DocumentPreviewPanel selectedResult={selectedResult} />
      </div>
    </div>
  );
}