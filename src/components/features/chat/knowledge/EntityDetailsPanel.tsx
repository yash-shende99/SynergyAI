import { User, Building, FileText } from 'lucide-react';

const EntityDetailsPanel = () => {
  // This would be populated with data from a clicked node
  const selectedEntity = { type: 'Person', name: 'Rohan Kapoor' };

  return (
    <div className="p-4 h-full">
      <div className="flex items-center gap-2 mb-4">
        {selectedEntity.type === 'Person' && <User size={18} className="text-primary" />}
        <h3 className="font-bold text-white">Entity Details</h3>
      </div>
      <div className="space-y-3">
        <div>
          <p className="text-xs text-secondary">Name</p>
          <p className="font-medium text-white">{selectedEntity.name}</p>
        </div>
        <div>
          <p className="text-xs text-secondary">Role</p>
          <p className="font-medium text-white">Director, AquaLogistics</p>
        </div>
        <div>
          <p className="text-xs text-secondary">Connections</p>
          <div className="mt-1 space-y-2 text-sm">
             <div className="flex items-center gap-2 text-slate-300 hover:text-white cursor-pointer">
                <Building size={16} /> <span>Director at AquaLogistics</span>
             </div>
             <div className="flex items-center gap-2 text-slate-300 hover:text-white cursor-pointer">
                <FileText size={16} /> <span>Mentioned in MSA.docx</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntityDetailsPanel;