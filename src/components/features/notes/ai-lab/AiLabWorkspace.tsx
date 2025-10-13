'use client';
import { FC, useState } from 'react';
import { Note, AiLabResult, AiLabAction } from '../../../../types';
import NoteSelector from './NoteSelector';
import ResultsDisplay from './ResultsDisplay';
import { Button } from '../../../ui/button';
import { Brain, FileText } from 'lucide-react';

interface AiLabWorkspaceProps {
  allNotes: Note[];
  onRunAction: (noteIds: string[], action: AiLabAction) => void;
  isProcessing: boolean;
  result: AiLabResult | null;
  error: string;
}

const AiLabWorkspace: FC<AiLabWorkspaceProps> = ({ allNotes, onRunAction, isProcessing, result, error }) => {
  const [selectedNoteIds, setSelectedNoteIds] = useState<string[]>([]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[80vh]">
      {/* Left Panel: Note Selection and Actions */}
      <div className="lg:col-span-4">
        <div className="p-4 rounded-xl border border-border bg-surface/50 h-full flex flex-col">
          <h3 className="font-semibold text-white mb-4">1. Select Notes to Analyze</h3>
          <NoteSelector 
            notes={allNotes}
            selectedNoteIds={selectedNoteIds}
            setSelectedNoteIds={setSelectedNoteIds}
          />
          <div className="mt-4 pt-4 border-t border-border">
            <h3 className="font-semibold text-white mb-2">2. Choose AI Action</h3>
            <div className="space-y-2">
              <Button className="w-full justify-start" variant="secondary" onClick={() => onRunAction(selectedNoteIds, 'summarize')} disabled={selectedNoteIds.length === 0 || isProcessing}>
                <FileText size={16} className="mr-2"/> Summarize Selected Notes
              </Button>
              <Button className="w-full justify-start" variant="secondary" onClick={() => onRunAction(selectedNoteIds, 'find_themes')} disabled={selectedNoteIds.length === 0 || isProcessing}>
                <Brain size={16} className="mr-2"/> Identify Common Themes
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* Right Panel: Results */}
      <div className="lg:col-span-8">
        <ResultsDisplay 
          result={result}
          isProcessing={isProcessing}
          error={error}
        />
      </div>
    </div>
  );
};
export default AiLabWorkspace;
