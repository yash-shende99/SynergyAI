import { FC } from 'react';
import {Button} from '../../../ui/button';
import { Scenario } from '../../../../types';
import { Save, RotateCcw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ScenarioHeaderProps {
  scenario: Scenario;
  onSave: () => void;
  onReset: () => void;
}
const ScenarioHeader: FC<ScenarioHeaderProps> = ({ scenario, onSave, onReset }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <Link href="/dashboard/valuation/scenarios" className="flex items-center gap-2 text-sm text-secondary hover:text-white mb-2">
            <ArrowLeft size={16}/> Back to Scenarios
        </Link>
        <h2 className="text-2xl font-bold text-white">Scenario Analysis</h2>
        <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-white">{scenario.name}</h2>
            <select className="bg-surface border border-border rounded-md px-2 py-1 text-sm">
                <option>{scenario.projectName}</option>
                <option>Project Neptune</option>
            </select>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button onClick={onReset} variant="secondary" size="sm"><RotateCcw size={16} className="mr-2"/>Reset</Button>
      <Button onClick={onSave} variant="default" size="sm"><Save size={16} className="mr-2"/>Save Scenario</Button>
      </div>
    </div>
  );
};

export default ScenarioHeader;