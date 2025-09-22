'use client';

import { useState } from 'react';
import ScenarioInputPanel from './ScenarioInputPanel';
import ScenarioVisualizationPanel from './ScenarioVisualizationPanel';
import ScenarioHeader from './ScenarioHeader';
import { Scenario } from '../../../../types'; // <-- Import our correct type

// --- FIX #1: Use the full Scenario type for initial state ---
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

export default function ScenariosSection() {
  const [scenario, setScenario] = useState<Scenario>(initialScenario);
  
  const handleReset = () => {
    setScenario(initialScenario);
    console.log("Scenario RESET to initial state.");
  };
  
  const handleSave = () => {
    console.log("SAVING Scenario:", scenario);
  };

  return (
    <div className="space-y-6">
      {/* --- FIX #2: Pass the full 'scenario' object, not 'scenarioName' --- */}
      <ScenarioHeader scenario={scenario} onSave={handleSave} onReset={handleReset} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        <div className="lg:col-span-1">
          {/* This now passes the correct types, fixing the remaining errors */}
          <ScenarioInputPanel scenario={scenario} setScenario={setScenario} />
        </div>

        <div className="lg:col-span-2">
          <ScenarioVisualizationPanel scenario={scenario} />
        </div>
      </div>
    </div>
  );
}