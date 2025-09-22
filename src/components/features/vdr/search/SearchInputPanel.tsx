import { Search, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';

const SearchInputPanel = () => {
  const [searchMode, setSearchMode] = useState<'fulltext' | 'semantic'>('semantic');

  return (
    <div className="p-4 rounded-xl border border-border bg-surface/50">
      <div className="flex items-center gap-2 mb-2">
        {/* Dual Mode Toggle */}
        <div className="flex items-center p-1 rounded-lg bg-background/50 border border-border">
          <button 
            onClick={() => setSearchMode('fulltext')}
            className={`px-2 py-1 text-xs rounded-md transition-colors ${searchMode === 'fulltext' ? 'bg-surface text-white' : 'text-secondary'}`}
          >
            Full-text
          </button>
          <button 
            onClick={() => setSearchMode('semantic')}
            className={`px-2 py-1 text-xs rounded-md transition-colors ${searchMode === 'semantic' ? 'bg-primary text-white' : 'text-secondary'}`}
          >
            Semantic (AI)
          </button>
        </div>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" size={20} />
        <input 
          type="text"
          placeholder={searchMode === 'semantic' ? "Search for concepts, e.g., 'clauses related to change of control'" : "Search for keywords..."}
          className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg text-white placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
       <div className="flex items-center gap-4 mt-2 text-xs text-secondary">
        <span>Filters:</span>
        <div className="flex items-center gap-2">
            <button className="px-2 py-1 bg-surface rounded">Category: Legal</button>
            <button className="px-2 py-1 bg-surface rounded">Uploader: Ananya</button>
        </div>
      </div>
    </div>
  );
};

export default SearchInputPanel;