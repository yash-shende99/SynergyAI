import { FC } from 'react';
import { Scenario } from '../../../../types';
import VariableSlider from './VariableSlider';
import DynamicFeedbackPanel from './DynamicFeedbackPanel';

interface ScenarioInputPanelProps {
  scenario: Scenario;
  setScenario: (scenario: Scenario) => void;
}

const ScenarioInputPanel: FC<ScenarioInputPanelProps> = ({ scenario, setScenario }) => {
  const handleVariableChange = (variable: keyof Scenario['variables'], value: number) => {
    setScenario({ ...scenario, variables: { ...scenario.variables, [variable]: value } });
  };
  
  // --- FIX #1: Add back the preset handler ---
  const handlePreset = (preset: 'best' | 'worst') => {
    if (preset === 'best') {
      setScenario({ ...scenario, variables: { ...scenario.variables, revenueChange: 25, cogsChange: -10 } });
    } else {
      setScenario({ ...scenario, variables: { ...scenario.variables, revenueChange: -15, cogsChange: 10 } });
    }
  };

  return (
    <div className="p-4 rounded-xl border border-border bg-surface/50 h-full space-y-4">
      <h3 className="font-semibold text-white">Define Scenario</h3>
      <input 
        type="text"
        value={scenario.name}
        onChange={(e) => setScenario({...scenario, name: e.target.value})}
        className="w-full bg-background border border-border rounded-md px-2 py-1.5 text-sm"
      />

      {/* --- FIX #2: Add back the preset buttons --- */}
      <div className="flex gap-2">
        <button onClick={() => handlePreset('best')} className="text-xs px-2 py-1 bg-green-500/30 text-green-300 rounded">Best Case</button>
        <button onClick={() => handlePreset('worst')} className="text-xs px-2 py-1 bg-red-500/30 text-red-300 rounded">Worst Case</button>
      </div>

      {/* --- FIX #3: Add the missing 'step' prop --- */}
      <VariableSlider label="Revenue Change" value={scenario.variables.revenueChange} onChange={(v) => handleVariableChange('revenueChange', v)} min={-50} max={50} step={1} unit="%"/>
      <VariableSlider label="COGS Change" value={scenario.variables.cogsChange} onChange={(v) => handleVariableChange('cogsChange', v)} min={-50} max={50} step={1} unit="%"/>
      
      <div>
        <label className="text-sm text-secondary">Discount Rate</label>
        <select value={scenario.variables.discountRate} onChange={(e) => handleVariableChange('discountRate', Number(e.target.value))} className="w-full mt-1 bg-background border border-border rounded-md px-2 py-1.5 text-sm">
            <option>8</option><option>10</option><option>12</option>
        </select>
      </div>
      <div>
        <label className="text-sm text-secondary">Tax Rate</label>
         <select value={scenario.variables.taxRate} onChange={(e) => handleVariableChange('taxRate', Number(e.target.value))} className="w-full mt-1 bg-background border border-border rounded-md px-2 py-1.5 text-sm">
            <option>20</option><option>25</option><option>30</option>
        </select>
      </div>

      <DynamicFeedbackPanel variables={scenario.variables} />
    </div>
  );
};
export default ScenarioInputPanel;