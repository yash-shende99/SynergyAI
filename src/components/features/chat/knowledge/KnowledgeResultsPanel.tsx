import { FC } from 'react';
import { Search, Share2 } from 'lucide-react';
import SnippetCard from './SnippetCard';
import type { Snippet } from './SnippetCard';
import {Button} from '../../../ui/button'; // Assuming you have your Button component

const mockSnippets: Snippet[] = [
  { type: 'VDR Doc', source: 'Master Service Agreement.docx', content: '...upon a <mark>change of control</mark>, the acquirer must provide written notice...' },
  { type: 'SEBI Filing', source: 'Infosys Annual Report FY24', content: '...a significant portion of our revenue is derived from clients located in <mark>North America</mark>...' },
  { type: 'News', source: 'Economic Times - Sep 2025', content: '...emerging competitors in the artificial intelligence sector pose a new challenge to established IT giants like <mark>Infosys</mark>...' },
];

// --- THIS IS THE NEW PROP ---
interface KnowledgeResultsPanelProps {
  onVisualizeClick: () => void;
}

const KnowledgeResultsPanel: FC<KnowledgeResultsPanelProps> = ({ onVisualizeClick }) => {
  return (
    <div className="space-y-4">
       <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" size={20} />
        <input 
          type="text"
          placeholder="Search across all documents and database entries..."
          className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-lg text-white"
        />
      </div>
      
      {/* --- THIS IS THE NEW BUTTON --- */}
      <div className="flex justify-end">
        <Button onClick={onVisualizeClick} variant="secondary" size="sm">
            <Share2 size={16} className="mr-2"/>
            Visualize All Results
        </Button>
      </div>

      <div className="space-y-4">
        {mockSnippets.map((snippet, index) => (
          <SnippetCard 
            key={index} 
            snippet={snippet}
            onVisualizeClick={onVisualizeClick}
          />
        ))}
      </div>
    </div>
  );
};

export default KnowledgeResultsPanel;