import { FC } from 'react';
import { Building, User, Info, Link as LinkIcon } from 'lucide-react';
import { GraphNode } from '../../../../types';

interface NodeDetailsPanelProps {
  selectedNode: GraphNode | null;
}

// Color mapping consistent with the graph
const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    'Target': '#3B82F6',     // Blue
    'Executive': '#10B981',  // Green
    'Competitor': '#EF4444', // Red
    'Subsidiary': '#8B5CF6', // Purple
    'Partner': '#F59E0B'     // Amber/Yellow
  };
  return colors[category] || '#6B7280';
};

const NodeDetailsPanel: FC<NodeDetailsPanelProps> = ({ selectedNode }) => {
  if (!selectedNode) {
    return (
      <div className="p-3 bg-background/50 rounded-lg text-center text-secondary text-sm">
        <Info size={24} className="mx-auto mb-2"/>
        <p>Click on a node in the graph to see its details.</p>
      </div>
    );
  }

  const getNodeIcon = (category: GraphNode['category']) => {
    switch (category) {
      case 'Target': return <Building size={16} style={{ color: getCategoryColor('Target') }}/>;
      case 'Competitor': return <Building size={16} style={{ color: getCategoryColor('Competitor') }}/>;
      case 'Subsidiary': return <Building size={16} style={{ color: getCategoryColor('Subsidiary') }}/>;
      case 'Executive': return <User size={16} style={{ color: getCategoryColor('Executive') }}/>;
      case 'Partner': return <Building size={16} style={{ color: getCategoryColor('Partner') }}/>;
      default: return <Info size={16} className="text-secondary"/>;
    }
  };

  return (
    <div>
      <h4 className="text-sm font-semibold text-secondary mb-2">Selected Node</h4>
      <div className="p-3 bg-background/50 rounded-lg space-y-2">
        <div className="flex items-center gap-2">
          {getNodeIcon(selectedNode.category)}
          <span className="font-bold text-white truncate">{selectedNode.name}</span>
        </div>
        <div className="text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-secondary">Type:</span> 
            <span 
              className="text-slate-300 font-medium"
              style={{ color: getCategoryColor(selectedNode.category) }}
            >
              {selectedNode.category}
            </span>
          </div>
          {selectedNode.value && (
            <div className="flex justify-between">
              <span className="text-secondary">Details:</span> 
              <span className="text-slate-300 truncate">{selectedNode.value}</span>
            </div>
          )}
        </div>
        <div className="pt-2 mt-2 border-t border-border/50">
          <button className="text-xs text-primary hover:underline flex items-center gap-1">
            <LinkIcon size={12}/> View Full Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default NodeDetailsPanel;