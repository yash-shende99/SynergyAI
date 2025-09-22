import GraphControls from './GraphControls';
import { Share2 } from 'lucide-react';

const GraphCanvas = () => {
  return (
    <div className="w-full h-full bg-surface/50 rounded-xl relative border border-border flex items-center justify-center p-4">
      <GraphControls />
      <div className="text-center text-secondary">
        <Share2 size={64} className="mx-auto mb-4 opacity-30"/>
        <p className="font-semibold text-lg">[Interactive D3.js Knowledge Graph Canvas]</p>
        <p className="text-sm">Visualizing relationships between companies, people, and documents.</p>
      </div>
      {/* Example nodes for visual context */}
      <div className="absolute top-1/3 left-1/4 p-2 text-xs rounded-full bg-blue-500 text-white animate-pulse">Company</div>
      <div className="absolute top-1/2 left-1/2 p-2 text-xs rounded-full bg-amber-500 text-white animate-pulse">Executive</div>
    </div>
  );
};

export default GraphCanvas;