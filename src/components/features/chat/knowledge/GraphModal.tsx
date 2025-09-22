import { FC } from 'react';
import { X } from 'lucide-react';
import GraphCanvas from './GraphCanvas';
import EntityDetailsPanel from './EntityDetailsPanel';

interface GraphModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GraphModal: FC<GraphModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative w-full h-full rounded-xl border border-border bg-background flex">
        <button onClick={onClose} className="absolute top-4 right-4 text-secondary hover:text-white z-10">
          <X size={24} />
        </button>
        
        {/* Main Graph Area */}
        <div className="flex-1 p-4">
          <GraphCanvas />
        </div>

        {/* Right Side Panel for Entity Details */}
        <div className="w-80 flex-shrink-0 border-l border-border bg-surface/50">
          <EntityDetailsPanel />
        </div>
      </div>
    </div>
  );
};

export default GraphModal;