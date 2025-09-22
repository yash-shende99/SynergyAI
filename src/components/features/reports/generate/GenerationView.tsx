import { FC } from 'react';
import { Bot, Zap } from 'lucide-react';
import {Button} from '../../../ui/button';

interface GenerationViewProps {
  state: 'idle' | 'running';
  onGenerate: () => void;
}

const GenerationView: FC<GenerationViewProps> = ({ state, onGenerate }) => (
  <div className="flex flex-col items-center justify-center h-full text-center p-8 rounded-xl border border-border bg-surface/50">
    <Bot size={48} className="text-primary mb-4"/>
    <h2 className="text-2xl font-bold text-white">Generate Your AI-Powered Investment Memo</h2>
    <p className="text-secondary mt-2 max-w-xl">Click the button below to analyze all your project data—VDR documents, valuation models, risk profiles, and synergy scores—and generate a comprehensive, editable first draft.</p>
    <div className="mt-8">
      {state === 'idle' && (
        <Button onClick={onGenerate} size="default" className="text-lg px-8 py-4">
          <Zap size={20} className="mr-2"/> Generate Memo
        </Button>
      )}
      {state === 'running' && (
        <div className="flex flex-col items-center">
            <p className="text-primary animate-pulse">Analyzing Synergy Score... Building Risk Profile...</p>
        </div>
      )}
    </div>
  </div>
);
export default GenerationView;