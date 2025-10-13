import { FC } from 'react';
import { AiLabResult } from '../../../../types';
import { Loader2, AlertTriangle, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ResultsDisplayProps {
  result: AiLabResult | null;
  isProcessing: boolean;
  error: string;
}

const ResultsDisplay: FC<ResultsDisplayProps> = ({ result, isProcessing, error }) => (
  <div className="p-6 rounded-xl border border-border bg-surface/50 h-full flex flex-col">
    <div className="flex items-center gap-3 mb-4">
      <Bot className="h-6 w-6 text-primary"/>
      <h3 className="text-lg font-bold text-white">AI Analysis Results</h3>
    </div>
    <div className="flex-1 overflow-y-auto bg-background/50 rounded-lg p-4 prose prose-sm prose-invert max-w-none">
      {isProcessing && <div className="flex items-center gap-2 text-secondary"><Loader2 className="animate-spin"/>Processing...</div>}
      {error && <div className="text-red-400"><AlertTriangle className="inline mr-2"/>{error}</div>}
      {result && result.action === 'summarize' && <ReactMarkdown>{result.output as string}</ReactMarkdown>}
      {result && result.action === 'find_themes' && (
        <ul>
          {(result.output as string[]).map((theme, index) => <li key={index}>{theme}</li>)}
        </ul>
      )}
      {!isProcessing && !error && !result && <p className="text-secondary">Select notes and an AI action to begin.</p>}
    </div>
  </div>
);

export default ResultsDisplay;
