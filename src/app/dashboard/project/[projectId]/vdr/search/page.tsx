'use client';

import { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { VdrSearchResult } from '../../../../../../types';
import { supabase } from '../../../../../../lib/supabaseClient'; // Import supabase
import SearchInputPanel from '../../../../../../components/features/vdr/search/SearchInputPanel';
import SearchResultsPanel from '../../../../../../components/features/vdr/search/SearchResultsPanel';
import DocumentPreviewPanel from '../../../../../../components/features/vdr/search/DocumentPreviewPanel';

export default function VDRSearchPage() {
  const [results, setResults] = useState<VdrSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedResult, setSelectedResult] = useState<VdrSearchResult | null>(null);
  const params = useParams();
  const projectId = params.projectId as string;

  // In your VDR search component
const handleSearch = useCallback(async (query: string, mode: 'semantic' | 'fulltext') => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    setError('');
    
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            setError('Please log in to search documents');
            return;
        }
        const response = await fetch(
            `http://localhost:8000/api/projects/${projectId}/vdr/search`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ query, mode })
            }
        );
        
        if (!response.ok) throw new Error('Search failed');
        
        const results = await response.json();
        setResults(results);
        
    } catch (err) {
        setError('Search failed. Please try again.');
    } finally {
        setIsLoading(false);
    }
}, [projectId]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[80vh]">
      <div className="flex flex-col gap-6">
        <SearchInputPanel onSearch={handleSearch} isLoading={isLoading} />
        <SearchResultsPanel 
          results={results} 
          isLoading={isLoading}
          error={error}
          onResultSelect={setSelectedResult} 
        />
      </div>
      <div>
        <DocumentPreviewPanel selectedResult={selectedResult} />
      </div>
    </div>
  );
}