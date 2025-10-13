'use client';
import { FC, useState } from 'react';
import { NoteSearchResult } from '../../../../types';
import { Search, Loader2 } from 'lucide-react';

interface SearchResultsPanelProps {
  onSearch: (query: string) => void;
  results: NoteSearchResult[];
  onSelectResult: (result: NoteSearchResult) => void;
  isLoading: boolean;
}

const SearchResultsPanel: FC<SearchResultsPanelProps> = ({ onSearch, results, onSelectResult, isLoading }) => {
  const [query, setQuery] = useState('');
  return (
    <div className="p-4 rounded-xl border border-border bg-surface/50 h-full flex flex-col">
      <div className="relative mb-4">
        <input type="text" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && onSearch(query)} placeholder="Semantic search across all notes..." className="w-full bg-background border border-border rounded-lg p-2 pl-8"/>
        <Search size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-secondary"/>
      </div>
      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
        {isLoading ? <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-primary"/></div> : 
         results.map(result => (
            <button key={result.id} onClick={() => onSelectResult(result)} className="w-full text-left p-3 rounded-lg hover:bg-surface">
                <p className="font-medium text-white truncate">{result.title}</p>
                <p className="text-xs text-secondary mt-1 line-clamp-2" dangerouslySetInnerHTML={{ __html: result.excerpt }}/>
            </button>
         ))
        }
      </div>
    </div>
  );
};

export default SearchResultsPanel;
