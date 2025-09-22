import { FC } from 'react';
import { Bot, FileText } from 'lucide-react';

const mockResults = [
  { id: 1, docName: 'Master Service Agreement.docx', excerpt: '...upon a <mark>change of control</mark>, the acquirer must provide written notice within thirty (30) days...' },
  { id: 2, docName: 'Employee Handbook.pdf', excerpt: '...any significant alteration in company ownership, defined as a <mark>change of control</mark>, may trigger...' },
];

interface SearchResultsPanelProps {
  onResultSelect: (result: any) => void;
}

const SearchResultsPanel: FC<SearchResultsPanelProps> = ({ onResultSelect }) => {
  return (
    <div className="p-4 rounded-xl border border-border bg-surface/50 h-full flex-1 flex flex-col">
      <h3 className="font-semibold text-white mb-4">Results (2)</h3>
      <div className="space-y-2 overflow-y-auto">
        <div className="flex items-start gap-2 text-sm p-2 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <Bot size={16} className="text-primary mt-1 flex-shrink-0"/>
            <p className="text-secondary">AI Suggestion: Ask about "termination rights upon acquisition"</p>
        </div>
        {mockResults.map(result => (
          <button 
            key={result.id} 
            onClick={() => onResultSelect(result)}
            className="w-full text-left p-3 rounded-lg hover:bg-surface transition-colors"
          >
            <div className="flex items-center gap-2 text-sm font-medium text-primary mb-1">
                <FileText size={16}/>
                <span>{result.docName}</span>
            </div>
            <p 
              className="text-sm text-secondary"
              dangerouslySetInnerHTML={{ __html: result.excerpt }} // Use with caution on real data
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchResultsPanel;