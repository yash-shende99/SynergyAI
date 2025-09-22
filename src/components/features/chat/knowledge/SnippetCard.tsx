import { FC } from 'react';
import { FileText, Newspaper, Database, Share2 } from 'lucide-react';
import {Button} from '../../../ui/button';

export interface Snippet {
  type: 'VDR Doc' | 'SEBI Filing' | 'News';
  source: string;
  content: string;
}

// --- THIS IS THE FIX ---
// 1. Add the new function to the component's props
interface SnippetCardProps {
  snippet: Snippet;
  onVisualizeClick: () => void;
}

const getSourceIcon = (type: Snippet['type']) => {
  switch (type) {
    case 'VDR Doc': return <FileText size={16} className="text-blue-400" />;
    case 'SEBI Filing': return <FileText size={16} className="text-amber-400" />;
    case 'News': return <Newspaper size={16} className="text-green-400" />;
    default: return <Database size={16} />;
  }
};

const SnippetCard: FC<SnippetCardProps> = ({ snippet, onVisualizeClick }) => {
  return (
    <div className="p-4 rounded-xl border border-border bg-surface/50">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2 text-xs">
          {getSourceIcon(snippet.type)}
          <span className="font-semibold text-secondary">{snippet.type}</span>
          <span className="text-slate-500">•</span>
          <span className="text-secondary truncate">{snippet.source}</span>
        </div>
        {/* 2. Connect the function to the button's onClick event */}
        <Button onClick={onVisualizeClick} variant="ghost" size="sm">
          <Share2 size={14} className="mr-2" />
          Graph this Snippet
        </Button>
      </div>
      <p 
        className="text-sm text-slate-300"
        dangerouslySetInnerHTML={{ __html: snippet.content.replace(/<mark>/g, '<mark class="bg-primary/30 text-white rounded px-1">') }}
      />
    </div>
  );
};

export default SnippetCard;