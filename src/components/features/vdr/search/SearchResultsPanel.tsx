'use client';

import { FC } from 'react';
import { VdrSearchResult } from '../../../../types';
import { Bot, FileText, Loader2, AlertTriangle, SearchX } from 'lucide-react';

interface SearchResultsPanelProps {
  results: VdrSearchResult[];
  isLoading: boolean;
  error: string;
  onResultSelect: (result: VdrSearchResult) => void;
}

const SearchResultsPanel: FC<SearchResultsPanelProps> = ({ results, isLoading, error, onResultSelect }) => {
  
  const renderContent = () => {
    // --- THIS IS THE DEFINITIVE FIX ---
    // The component now has a robust, multi-stage rendering logic.

    // 1. Handle the Loading State
    if (isLoading) {
      return (
        <div className="flex flex-col justify-center items-center h-full text-secondary">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4"/>
          <p className="font-semibold">Searching VDR...</p>
        </div>
      );
    }

    // 2. Handle the Error State
    if (error) {
      return (
        <div className="flex flex-col justify-center items-center h-full text-red-400 text-center">
          <AlertTriangle className="h-8 w-8 mb-2"/>
          <p className="font-semibold">Search Failed</p>
          <p className="text-sm text-secondary">{error}</p>
        </div>
      );
    }

    // 3. Handle the "No Results" State
    if (results.length === 0) {
        return (
            <div className="flex flex-col justify-center items-center h-full text-secondary text-center">
                <SearchX size={48} className="mb-4 opacity-50"/>
                <p className="font-semibold text-white">No Results Found</p>
                <p className="text-sm">Your search did not match any content in the project's documents. Try a different query or search mode.</p>
            </div>
        );
    }

    // 4. Handle the Success State (Display the results)
    return (
      <>
        <div className="flex items-start gap-2 text-sm p-2 rounded-lg bg-blue-500/10 border border-blue-500/30 mb-2">
          <Bot size={16} className="text-primary mt-1 flex-shrink-0"/>
          <p className="text-secondary">AI Suggestion: Try searching for "termination rights upon acquisition".</p>
        </div>
        {results.map((result, index) => (
          <button 
            key={index} // Using index as key is acceptable here as list is read-only
            onClick={() => onResultSelect(result)}
            className="w-full text-left p-3 rounded-lg hover:bg-surface transition-colors"
          >
            <div className="flex items-center gap-2 text-sm font-medium text-primary mb-1">
                <FileText size={16}/>
                <span className="truncate">{result.docName}</span>
            </div>
            <p 
              className="text-sm text-secondary line-clamp-2" // Truncate long excerpts
              dangerouslySetInnerHTML={{ __html: result.excerpt.replace(/<mark>/g, '<mark class="bg-primary/20 text-white rounded px-1">') }}
            />
          </button>
        ))}
      </>
    );
  };
  
  return (
    <div className="p-4 rounded-xl border border-border bg-surface/50 h-full flex-1 flex flex-col">
      <h3 className="font-semibold text-white mb-4">Results {results.length > 0 && !isLoading ? `(${results.length})` : ''}</h3>
      <div className="space-y-2 overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default SearchResultsPanel;
