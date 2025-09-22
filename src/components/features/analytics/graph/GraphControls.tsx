import { ZoomIn, ZoomOut, Filter, Search } from 'lucide-react';

const GraphControls = () => {
  return (
    <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
        <div className="relative w-1/3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" size={18} />
            <input 
              type="text"
              placeholder="Search company / executive..."
              className="w-full pl-10 pr-4 py-2 bg-background/80 border border-border rounded-lg text-sm"
            />
        </div>
        <div className="bg-background/80 border border-border rounded-lg p-1 flex items-center gap-1">
          <button className="p-2 text-secondary hover:bg-surface rounded-md"><ZoomIn size={18} /></button>
          <button className="p-2 text-secondary hover:bg-surface rounded-md"><ZoomOut size={18} /></button>
          <div className="w-px h-6 bg-border mx-1"></div>
          <button className="p-2 text-secondary hover:bg-surface rounded-md"><Filter size={18} /></button>
        </div>
    </div>
  );
};

export default GraphControls;