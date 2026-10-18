'use client';

import { FC, useState, useEffect, useCallback } from 'react';
import { Search, Share2, Loader2, Database, AlertCircle } from 'lucide-react';
import SnippetCard from './SnippetCard';
import type { Snippet } from './SnippetCard';
import { Button } from '../../../ui/button';

interface KnowledgeResultsPanelProps {
  onVisualizeClick: () => void;
  activeFilter?: string;
  companyFilter?: string;
  dateRange?: string;
}

const defaultSnippets: Snippet[] = [
  { type: 'VDR Doc', source: 'Master Service Agreement.docx', content: '...upon a <mark>change of control</mark>, the acquirer must provide written notice...' },
  { type: 'SEBI Filing', source: 'Infosys Annual Report FY24', content: '...a significant portion of our revenue is derived from clients located in <mark>North America</mark>...' },
  { type: 'News', source: 'Economic Times - Sep 2025', content: '...emerging competitors in the artificial intelligence sector pose a new challenge to established IT giants like <mark>Infosys</mark>...' },
];

const KnowledgeResultsPanel: FC<KnowledgeResultsPanelProps> = ({
  onVisualizeClick,
  activeFilter = 'All Sources',
  companyFilter = '',
  dateRange = 'All Time'
}) => {
  const [query, setQuery] = useState('');
  const [snippets, setSnippets] = useState<Snippet[]>(defaultSnippets);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const performSearch = useCallback(async (searchQuery: string, sourceFilter: string, company: string, range: string) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/chat/knowledge/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          source_type: sourceFilter,
          company: company,
          date_range: range
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data.results) && data.results.length > 0) {
          setSnippets(data.results);
          setHasSearched(true);
          return;
        }
      }
      // If no results returned from API
      if (searchQuery.trim()) {
        setSnippets([]);
      }
      setHasSearched(true);
    } catch (err) {
      console.error('Knowledge search failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Trigger search on debounced input or filter change
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query, activeFilter, companyFilter, dateRange);
    }, 400);

    return () => clearTimeout(timer);
  }, [query, activeFilter, companyFilter, dateRange, performSearch]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" size={20} />
        <input 
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search across all indexed documents, SEBI filings, contracts, and market entries..."
          className="w-full pl-10 pr-12 py-3 bg-surface border border-border rounded-lg text-white placeholder-secondary focus:outline-none focus:border-primary transition-colors"
        />
        {loading && (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-primary" size={18} />
        )}
      </div>
      
      <div className="flex justify-between items-center text-xs text-secondary px-1">
        <span>
          {loading ? 'Searching indexed neural vector database...' : `Showing ${snippets.length} citations ${activeFilter !== 'All Sources' ? `• Filter: ${activeFilter}` : ''}`}
        </span>
        <Button onClick={onVisualizeClick} variant="secondary" size="sm" className="h-8">
          <Share2 size={14} className="mr-1.5"/>
          Visualize All Results
        </Button>
      </div>

      {snippets.length === 0 && !loading && (
        <div className="p-8 text-center rounded-xl border border-border bg-surface/30">
          <Database className="mx-auto h-10 w-10 text-secondary mb-3 opacity-60" />
          <h4 className="text-white font-medium text-base mb-1">No matching citations found</h4>
          <p className="text-secondary text-sm max-w-md mx-auto">
            Try adjusting your search terms, removing source filters, or searching for specific clauses like "indemnity", "revenue", or "governance".
          </p>
        </div>
      )}

      <div className="space-y-4">
        {snippets.map((snippet, index) => (
          <SnippetCard 
            key={`${snippet.source}-${index}`} 
            snippet={snippet}
            onVisualizeClick={onVisualizeClick}
          />
        ))}
      </div>
    </div>
  );
};

export default KnowledgeResultsPanel;