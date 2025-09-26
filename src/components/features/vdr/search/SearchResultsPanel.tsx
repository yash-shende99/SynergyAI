import { FC } from 'react';
import { VdrSearchResult } from '../../../../types';
import { FileText, Loader2, AlertTriangle } from 'lucide-react';

interface SearchResultsPanelProps {
  results: VdrSearchResult[];
  isLoading: boolean;
  error: string;
  onResultSelect: (result: VdrSearchResult) => void;
}

const SearchResultsPanel: FC<SearchResultsPanelProps> = ({ results, isLoading, error, onResultSelect }) => (
    <div className="p-4 rounded-xl border border-border bg-surface/50 h-full flex-1 flex flex-col">
      <h3 className="font-semibold text-white mb-4">Results {results.length > 0 ? `(${results.length})` : ''}</h3>
      <div className="space-y-2 overflow-y-auto flex-1">
        {isLoading && <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-primary"/></div>}
        {error && <div className="text-red-400 text-center"><AlertTriangle className="mx-auto mb-2"/>{error}</div>}
        {!isLoading && !error && results.map(result => (
          <button key={result.docId} onClick={() => onResultSelect(result)} className="w-full text-left p-3 rounded-lg hover:bg-surface">
            <div className="flex items-center gap-2 text-sm font-medium text-primary mb-1"><FileText size={16}/><span>{result.docName}</span></div>
            <p className="text-sm text-secondary" dangerouslySetInnerHTML={{ __html: result.excerpt.replace(/<mark>/g, '<mark class="bg-primary/20 text-white rounded px-1">') }} />
          </button>
        ))}
      </div>
    </div>
);
export default SearchResultsPanel;