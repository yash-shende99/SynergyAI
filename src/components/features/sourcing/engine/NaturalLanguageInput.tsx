import { FC, useState } from 'react';
import { BrainCircuit, Sparkles } from 'lucide-react';
import {Button} from '../../../ui/button';

interface NaturalLanguageInputProps {
  onGenerate: (query: string) => void;
  isLoading: boolean;
}

const NaturalLanguageInput: FC<NaturalLanguageInputProps> = ({ onGenerate, isLoading }) => {
  const [query, setQuery] = useState('');
  return (
    <div className="p-6 rounded-xl border border-border bg-surface/50">
      <div className="flex items-center gap-3 mb-2">
        <BrainCircuit className="h-6 w-6 text-primary" />
        <h3 className="text-lg font-bold text-white">Strategic Sourcing Engine</h3>
      </div>
      <p className="text-sm text-secondary mb-4">
        Describe your acquisition goal in plain English. The AI will query the database and rank the best fits.
      </p>
      <div className="relative">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g., “Find logistics startups in Tier-2 cities with >₹100Cr revenue and positive cash flow...”"
          className="w-full h-24 p-3 pr-32 bg-background border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <Button onClick={() => onGenerate(query)} disabled={isLoading || !query} size="sm" className="absolute right-3 bottom-3">
          {isLoading ? <span className="animate-pulse">Analyzing...</span> : <><Sparkles size={16} className="mr-2" />Generate</>}
        </Button>
      </div>
    </div>
  );
};
export default NaturalLanguageInput;