import { ZoomIn, ZoomOut, Filter } from 'lucide-react';

const GraphControls = () => {
  return (
    <div className="absolute top-4 left-4 bg-background/80 border border-border rounded-lg p-1 flex items-center gap-1">
      <button className="p-2 text-secondary hover:bg-surface rounded-md"><ZoomIn size={18} /></button>
      <button className="p-2 text-secondary hover:bg-surface rounded-md"><ZoomOut size={18} /></button>
      <div className="w-px h-6 bg-border mx-1"></div>
      <button className="p-2 text-secondary hover:bg-surface rounded-md"><Filter size={18} /></button>
    </div>
  );
};

export default GraphControls;