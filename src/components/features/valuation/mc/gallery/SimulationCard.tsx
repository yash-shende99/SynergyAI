import { FC } from 'react';
import { MonteCarloSimulation } from '../../../../../types';
import Link from 'next/link';
import { Copy, Trash2 } from 'lucide-react';

interface SimulationCardProps {
  simulation: MonteCarloSimulation;
  onDelete: () => void;
  onDuplicate: () => void;
}

const SimulationCard: FC<SimulationCardProps> = ({ simulation, onDelete, onDuplicate }) => {
  return (
    <div className="rounded-2xl border border-border bg-surface/50 p-6 flex flex-col group">
      <div className="flex-1">
        <p className="text-xs text-secondary">{simulation.projectName}</p>
        <h3 className="text-lg font-bold text-white mt-1">{simulation.name}</h3>
        <p className="text-sm text-slate-300 mt-2 h-10">{simulation.summary}</p>
      </div>
      <div className="mt-4 pt-4 border-t border-border/50 flex justify-between items-center">
        <Link href={`/dashboard/valuation/mc/${simulation.id}`} className="text-sm font-semibold text-primary hover:underline">
          Open Simulation
        </Link>
        <div className="flex items-center gap-2 text-secondary">
          <button onClick={(e) => { e.stopPropagation(); onDuplicate(); }} className="hover:text-primary"><Copy size={16} /></button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="hover:text-red-500"><Trash2 size={16} /></button>
        </div>
      </div>
    </div>
  );
};
export default SimulationCard;