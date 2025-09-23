'use client';

import { useState } from 'react';
import { Scenario } from '../../../../../../../types';
import ScenarioHeader from '../../../../../../../components/features/valuation/scenarios/ScenarioHeader';
import ScenarioInputPanel from '../../../../../../../components/features/valuation/scenarios/ScenarioInputPanel';
import ScenarioVisualizationPanel from '../../../../../../../components/features/valuation/scenarios/ScenarioVisualizationPanel';

// In a real app, this data would be fetched based on the [scenarioId] param from the URL
const initialScenario: Scenario = { 
  id: 'scen-1', 
  name: 'Aggressive Growth Case', 
  projectName: 'Project Helios', 
  summary: '', 
  variables: { 
    revenueChange: 15, 
    cogsChange: -5, 
    taxRate: 25, 
    discountRate: 10 
  } 
};

export default function ScenarioWorkspacePage() {
  const [scenario, setScenario] = useState<Scenario>(initialScenario);
  
  const handleReset = () => {
    setScenario(initialScenario);
    console.log("Scenario RESET to initial state.");
  };
  
  const handleSave = () => {
    console.log("SAVING Scenario:", scenario);
    // Add logic to save to a database here
  };

  return (
    // The page now has its own padding and layout control
    <div className=" space-y-6">
      {/* The page's own header is rendered here, inside the main content area */}
      <ScenarioHeader scenario={scenario} onSave={handleSave} onReset={handleReset} />
      
      {/* The rest of the workspace layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ScenarioInputPanel scenario={scenario} setScenario={setScenario} />
        </div>
        <div className="lg:col-span-2">
          <ScenarioVisualizationPanel scenario={scenario} />
        </div>
      </div>
    </div>
  );
}