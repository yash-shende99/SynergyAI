import GraphControls from './GraphControls';
import { Share2 } from 'lucide-react';

const GraphCanvas = () => {
  return (
    <div className="w-full h-full bg-surface/50 rounded-lg relative border border-border flex items-center justify-center">
      <GraphControls />
      <div className="text-center text-secondary">
        <Share2 size={64} className="mx-auto mb-4 opacity-30"/>
        <p className="font-semibold text-lg">[Interactive D3.js Knowledge Graph Canvas]</p>
        <p className="text-sm">Visualizing relationships between companies, people, and documents.</p>
      </div>
    </div>
  );
};

export default GraphCanvas;