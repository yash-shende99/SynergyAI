import { FC } from 'react';
import { MonteCarloSimulation } from '../../../../types';
import {Button} from '../../../ui/button';
import { Save, RotateCcw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface WorkspaceHeaderProps {
  simulation: MonteCarloSimulation;
  onSave: () => void;
  onReset: () => void;
}

const WorkspaceHeader: FC<WorkspaceHeaderProps> = ({ simulation, onSave, onReset }) => (
  <div>
    <Link href="/dashboard/valuation/mc" className="flex items-center gap-2 text-sm text-secondary hover:text-white mb-2">
        <ArrowLeft size={16}/> Back to Simulations
    </Link>
    <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-white">{simulation.name}</h2>
            <select className="bg-surface border border-border rounded-md px-2 py-1 text-sm">
                <option>{simulation.projectName}</option>
            </select>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={onReset} variant="secondary" size="sm"><RotateCcw size={16} className="mr-2"/>Reset</Button>
          <Button onClick={onSave} variant="default" size="sm"><Save size={16} className="mr-2"/>Save</Button>
        </div>
    </div>
  </div>
);
export default WorkspaceHeader;