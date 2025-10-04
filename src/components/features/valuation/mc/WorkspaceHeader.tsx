// components/features/valuation/mc/WorkspaceHeader.tsx
import { FC, useState } from 'react';
import { MonteCarloSimulation } from '../../../../types';
import {Button} from '../../../ui/button';
import { Save, RotateCcw, ArrowLeft, Edit, Check, X } from 'lucide-react';
import Link from 'next/link';

interface WorkspaceHeaderProps {
  simulation: MonteCarloSimulation;
  onSave: () => void;
  onReset: () => void;
  onNameChange: (name: string) => void;
  isSaving?: boolean;
}

const WorkspaceHeader: FC<WorkspaceHeaderProps> = ({ 
  simulation, 
  onSave, 
  onReset, 
  onNameChange,
  isSaving = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(simulation.name);

  const handleSaveName = () => {
    onNameChange(editName);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditName(simulation.name);
    setIsEditing(false);
  };

  return (
    <div>
      <Link 
        href={`/dashboard/project/${simulation.projectId}/valuation/mc`} 
        className="flex items-center gap-2 text-sm text-secondary hover:text-white mb-2"
      >
        <ArrowLeft size={16}/> Back to Simulations
      </Link>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="text-2xl font-bold text-white bg-transparent border-b border-primary focus:outline-none focus:border-primary-300"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveName();
                  if (e.key === 'Escape') handleCancelEdit();
                }}
              />
              <button 
                onClick={handleSaveName}
                className="text-green-400 hover:text-green-300"
              >
                <Check size={16} />
              </button>
              <button 
                onClick={handleCancelEdit}
                className="text-red-400 hover:text-red-300"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-white">{simulation.name}</h2>
              <button 
                onClick={() => setIsEditing(true)}
                className="text-secondary hover:text-primary"
              >
                <Edit size={16} />
              </button>
            </div>
          )}
          <span className="text-sm text-secondary bg-surface px-2 py-1 rounded">
            {simulation.projectName}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={onReset} variant="secondary" size="sm" disabled={isSaving}>
            <RotateCcw size={16} className="mr-2"/>
            Reset
          </Button>
          <Button onClick={onSave} variant="default" size="sm" disabled={isSaving}>
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save size={16} className="mr-2"/>
                Save
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceHeader;