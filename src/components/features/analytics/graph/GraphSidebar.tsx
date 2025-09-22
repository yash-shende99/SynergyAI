import { FC } from 'react';
import { PanelRightClose, PanelRightOpen } from 'lucide-react';
import NodeDetailsPanel from './NodeDetailsPanel';
import GraphLegendPanel from './GraphLegendPanel';
import GraphFiltersPanel from './GraphFiltersPanel';

interface GraphSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  selectedNode: any; // In a real app, this would be a specific type
}

const GraphSidebar: FC<GraphSidebarProps> = ({ isOpen, onToggle, selectedNode }) => {
  return (
    <div className={`transition-all duration-300 ${isOpen ? 'w-80' : 'w-12'}`}>
      <div className="p-4 rounded-xl border border-border bg-surface/50 h-full flex flex-col">
        <div className="flex justify-between items-center mb-4">
          {isOpen && <h3 className="font-semibold text-white">Graph Details</h3>}
          <button onClick={onToggle} className="text-secondary hover:text-primary">
            {isOpen ? <PanelRightClose size={20} /> : <PanelRightOpen size={20} />}
          </button>
        </div>
        {isOpen && (
          <div className="flex-1 overflow-y-auto space-y-4">
            <NodeDetailsPanel selectedNode={selectedNode} />
            <GraphLegendPanel />
            <GraphFiltersPanel />
          </div>
        )}
      </div>
    </div>
  );
};

export default GraphSidebar;