'use client';

import { FC, useState } from 'react';
import { Search } from 'lucide-react';
import{ Button} from '../../../ui/button';

interface SearchInputPanelProps {
  onSearch: (query: string, mode: 'semantic' | 'fulltext') => void;
  isLoading: boolean;
}

const SearchInputPanel: FC<SearchInputPanelProps> = ({ onSearch, isLoading }) => {
  const [searchMode, setSearchMode] = useState<'semantic' | 'fulltext'>('semantic');
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    onSearch(query, searchMode);
  };

  return (
    <div className="p-4 rounded-xl border border-border bg-surface/50">
      <div className="flex items-center p-1 rounded-lg bg-background/50 border border-border w-min mb-4">
        <button onClick={() => setSearchMode('fulltext')} className={`px-2 py-1 text-xs rounded-md ${searchMode === 'fulltext' ? 'bg-surface text-white' : 'text-secondary'}`}>Keyword</button>
        <button onClick={() => setSearchMode('semantic')} className={`px-2 py-1 text-xs rounded-md ${searchMode === 'semantic' ? 'bg-primary text-white' : 'text-secondary'}`}>Semantic (AI)</button>
      </div>
      <div className="relative">
        <input 
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder={searchMode === 'semantic' ? "Search for concepts, e.g., 'change of control clauses'" : "Search for exact keywords..."}
          className="w-full pl-4 pr-24 py-3 bg-background border border-border rounded-lg"
        />
        <Button onClick={handleSearch} disabled={isLoading} size="sm" className="absolute right-2 top-1/2 -translate-y-1/2">
          {isLoading ? '...' : <Search size={16}/>}
        </Button>
      </div>
    </div>
  );
};
export default SearchInputPanel;