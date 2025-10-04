import { FC } from 'react';
import { Bot, Zap, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '../../../ui/button';

interface GenerationViewProps {
  isGenerating: boolean;
  onGenerate: () => void;
  error: string;
}

const GenerationView: FC<GenerationViewProps> = ({ isGenerating, onGenerate, error }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 rounded-xl border border-border bg-surface/50">
    <Bot size={64} className="text-primary mb-6" />
    
    <h2 className="text-3xl font-bold text-white mb-4">
      Generate AI-Powered Investment Memo
    </h2>
    
    <p className="text-secondary text-lg mb-8 max-w-2xl">
      Click below to synthesize all your project data—documents, valuation models, risk profiles, and synergy scores—into a comprehensive, editable first draft.
    </p>

    <div className="space-y-4">
      <Button 
        onClick={onGenerate} 
        size="lg" 
        disabled={isGenerating}
        className="min-w-[200px]"
      >
        {isGenerating ? (
          <>
            <Loader2 size={20} className="mr-2 animate-spin" />
            Analyzing Data...
          </>
        ) : (
          <>
            <Zap size={20} className="mr-2" />
            Generate Memo
          </>
        )}
      </Button>

      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
          <div className="flex items-center gap-2 text-red-400">
            <AlertTriangle size={20} />
            <span className="font-medium">Generation Error</span>
          </div>
          <p className="text-sm text-red-300 mt-1">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onGenerate}
            className="mt-3"
          >
            <RefreshCw size={16} className="mr-2" />
            Try Again
          </Button>
        </div>
      )}
    </div>

    <div className="mt-8 text-xs text-slate-500">
      <p>Uses AI to analyze VDR documents, financial data, and market context</p>
    </div>
  </div>
);

export default GenerationView;