// components/features/valuation/scenarios/ScenarioInputPanel.tsx
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
  
  const handlePreset = (preset: 'best' | 'worst' | 'base') => {
    if (preset === 'best') {
      setScenario({ 
        ...scenario, 
        variables: { 
          ...scenario.variables, 
          revenueChange: 25, 
          cogsChange: -10,
          taxRate: 20,
          discountRate: 8
        } 
      });
    } else if (preset === 'worst') {
      setScenario({ 
        ...scenario, 
        variables: { 
          ...scenario.variables, 
          revenueChange: -15, 
          cogsChange: 10,
          taxRate: 30,
          discountRate: 12
        } 
      });
    } else {
      // Base case
      setScenario({ 
        ...scenario, 
        variables: { 
          ...scenario.variables, 
          revenueChange: 0, 
          cogsChange: 0,
          taxRate: 25,
          discountRate: 10
        } 
      });
    }
  };

  return (
    <div className="p-4 rounded-xl border border-border bg-surface/50 h-full space-y-4">
      <h3 className="font-semibold text-white">Define Scenario</h3>
      
      {/* Scenario Name */}
      <div>
        <label className="text-sm text-secondary mb-1 block">Scenario Name</label>
        <input 
          type="text"
          value={scenario.name}
          onChange={(e) => setScenario({...scenario, name: e.target.value})}
          className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
          placeholder="Enter scenario name"
        />
      </div>

      {/* Preset Buttons */}
      <div className="flex gap-2">
        <button 
          onClick={() => handlePreset('base')} 
          className="flex-1 text-xs px-3 py-2 bg-slate-600/30 text-slate-300 rounded hover:bg-slate-600/50 transition-colors"
        >
          Base Case
        </button>
        <button 
          onClick={() => handlePreset('best')} 
          className="flex-1 text-xs px-3 py-2 bg-green-500/30 text-green-300 rounded hover:bg-green-500/50 transition-colors"
        >
          Best Case
        </button>
        <button 
          onClick={() => handlePreset('worst')} 
          className="flex-1 text-xs px-3 py-2 bg-red-500/30 text-red-300 rounded hover:bg-red-500/50 transition-colors"
        >
          Worst Case
        </button>
      </div>

      {/* Variable Sliders */}
      <div className="space-y-4">
        <VariableSlider 
          label="Revenue Change" 
          value={scenario.variables.revenueChange} 
          onChange={(v) => handleVariableChange('revenueChange', v)} 
          min={-50} 
          max={50} 
          step={1} 
          unit="%"
        />
        <VariableSlider 
          label="COGS Change" 
          value={scenario.variables.cogsChange} 
          onChange={(v) => handleVariableChange('cogsChange', v)} 
          min={-50} 
          max={50} 
          step={1} 
          unit="%"
        />
        
        <div>
          <label className="text-sm text-secondary mb-1 block">Discount Rate</label>
          <select 
            value={scenario.variables.discountRate} 
            onChange={(e) => handleVariableChange('discountRate', Number(e.target.value))} 
            className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
          >
            <option value={8}>8%</option>
            <option value={9}>9%</option>
            <option value={10}>10%</option>
            <option value={11}>11%</option>
            <option value={12}>12%</option>
            <option value={13}>13%</option>
            <option value={14}>14%</option>
            <option value={15}>15%</option>
          </select>
        </div>
        
        <div>
          <label className="text-sm text-secondary mb-1 block">Tax Rate</label>
          <select 
            value={scenario.variables.taxRate} 
            onChange={(e) => handleVariableChange('taxRate', Number(e.target.value))} 
            className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
          >
            <option value={15}>15%</option>
            <option value={20}>20%</option>
            <option value={25}>25%</option>
            <option value={30}>30%</option>
            <option value={35}>35%</option>
          </select>
        </div>
      </div>

      <DynamicFeedbackPanel variables={scenario.variables} />
    </div>
  );
};

export default ScenarioInputPanel;