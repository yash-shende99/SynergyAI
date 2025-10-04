import { FC } from 'react';
import { MonteCarloSimulation, DistributionType } from '../../../../types';
import VariableSlider from '../scenarios/VariableSlider';
import {Button} from '../../../ui/button';
import { Play } from 'lucide-react';

interface ControlPanelProps {
  simulation: MonteCarloSimulation;
  setSimulation: (sim: MonteCarloSimulation) => void;
  simState: string;
  progress: number;
  onRunSimulation: () => void;
}

const ControlPanel: FC<ControlPanelProps> = ({ 
  simulation, 
  setSimulation, 
  simState, 
  progress, 
  onRunSimulation 
}) => {

  const handleVarChange = (
    variable: keyof MonteCarloSimulation['variables'], 
    value: number | DistributionType
  ) => {
    setSimulation({ 
      ...simulation, 
      variables: { 
        ...simulation.variables, 
        [variable]: value 
      } 
    });
  };

  return (
    <div className="p-4 rounded-xl border border-border bg-surface/50 h-full flex flex-col">
      <h3 className="font-semibold text-white mb-4">Assumptions</h3>
      <div className="space-y-4 flex-1">
        <VariableSlider 
          label="Revenue Growth" 
          value={simulation.variables.revenueGrowth} 
          onChange={(v) => handleVarChange('revenueGrowth', v)} 
          min={5} 
          max={15} 
          step={0.5} 
          unit="%"
        />
        <VariableSlider 
          label="EBITDA Margin" 
          value={simulation.variables.ebitdaMargin} 
          onChange={(v) => handleVarChange('ebitdaMargin', v)} 
          min={25} 
          max={40} 
          step={0.5} 
          unit="%"
        />
        <VariableSlider 
          label="Cost of Capital" 
          value={simulation.variables.costOfCapital} 
          onChange={(v) => handleVarChange('costOfCapital', v)} 
          min={7} 
          max={12} 
          step={0.1} 
          unit="%"
        />
      </div>
      <div>
        <h4 className="text-sm font-semibold text-secondary mb-2">Parameters</h4>
        <div className="space-y-2">
          <div>
            <label className="text-xs text-slate-400">Iterations</label>
            <select 
              value={simulation.variables.iterations} 
              onChange={(e) => handleVarChange('iterations', Number(e.target.value))} 
              className="w-full mt-1 bg-background border border-border rounded-md px-2 py-1.5 text-sm"
            >
              <option value={1000}>1,000</option>
              <option value={5000}>5,000</option>
              <option value={10000}>10,000</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400">Distribution Type</label>
            <select 
              value={simulation.variables.distribution} 
              onChange={(e) => handleVarChange('distribution', e.target.value as DistributionType)} 
              className="w-full mt-1 bg-background border border-border rounded-md px-2 py-1.5 text-sm"
            >
              <option value="Normal">Normal</option>
              <option value="Lognormal">Lognormal</option>
              <option value="Uniform">Uniform</option>
            </select>
          </div>
        </div>
      </div>
      <div className="mt-4">
        {simState === 'running' ? (
          <div>
            <p className="text-sm text-secondary text-center">Running {simulation.variables.iterations.toLocaleString()} iterations...</p>
            <div className="w-full bg-border rounded-full h-2 mt-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        ) : (
          <Button onClick={onRunSimulation} size="default" className="w-full">
            <Play size={16} className="mr-2"/>
            Run Simulation
          </Button>
        )}
      </div>
    </div>
  );
};

export default ControlPanel;