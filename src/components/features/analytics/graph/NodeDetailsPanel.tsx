import { FC } from 'react';
import { Building } from 'lucide-react';

const NodeDetailsPanel: FC<{ selectedNode: any }> = ({ selectedNode }) => (
  <div>
    <h4 className="text-sm font-semibold text-secondary mb-2">Node Details</h4>
    <div className="p-3 bg-background/50 rounded-lg space-y-2">
      <div className="flex items-center gap-2">
        <Building size={16} className="text-blue-400"/>
        <span className="font-bold text-white">{selectedNode.name}</span>
      </div>
      <div className="text-xs space-y-1">
        <div className="flex justify-between"><span className="text-secondary">Industry:</span> <span className="text-slate-300">Renewable Energy</span></div>
        <div className="flex justify-between"><span className="text-secondary">Revenue:</span> <span className="text-slate-300">$500M</span></div>
      </div>
    </div>
  </div>
);
export default NodeDetailsPanel;