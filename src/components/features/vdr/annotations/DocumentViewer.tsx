import { FC } from 'react';
// --- FIX FOR ICON BUG ---
// Replace 'Versions' with 'Layers', which exists in the library
import { ZoomIn, ZoomOut, Layers } from 'lucide-react';
import { ThreadKey } from './AnnotationsSection'; // Import the shared type

interface DocumentViewerProps {
  documentName: string;
  activeThreadId: ThreadKey | null;
  onSelectThread: (threadId: ThreadKey) => void;
}

const DocumentViewer: FC<DocumentViewerProps> = ({ documentName, activeThreadId, onSelectThread }) => {
  return (
    <div className="rounded-xl border border-border bg-surface/50 h-full flex flex-col">
      <div className="flex justify-between items-center p-2 border-b border-border">
        <span className="text-sm font-medium text-white">{documentName}</span>
        <div className="flex items-center gap-2 text-secondary">
          <button className="hover:text-white"><ZoomOut size={16}/></button>
          <button className="hover:text-white"><ZoomIn size={16}/></button>
          {/* Use the corrected icon here */}
          <button className="hover:text-white"><Layers size={16}/></button>
        </div>
      </div>
      <div className="flex-1 p-6 bg-background/50 overflow-y-auto text-sm leading-relaxed text-slate-300">
        <p>
          This Agreement is made and entered into as of the Effective Date by and between the parties. 
          <button onClick={() => onSelectThread('thread-01')} className={`mx-1 px-1 rounded transition-colors ${activeThreadId === 'thread-01' ? 'bg-amber-500/40' : 'bg-amber-500/20 hover:bg-amber-500/30'}`}>
            The term of this Agreement shall commence on the Effective Date and shall continue for a period of five (5) years
          </button>
          unless terminated earlier pursuant to the terms of this Agreement.
        </p>
        <p className="mt-4">
          Upon a change of control, the acquirer must provide written notice.
          <button onClick={() => onSelectThread('thread-02')} className={`ml-1 px-1 rounded transition-colors ${activeThreadId === 'thread-02' ? 'bg-red-500/40' : 'bg-red-500/20 hover:bg-red-500/30'}`}>
            This clause is critical for the transaction and requires immediate legal review.
          </button>
        </p>
      </div>
    </div>
  );
};

export default DocumentViewer;