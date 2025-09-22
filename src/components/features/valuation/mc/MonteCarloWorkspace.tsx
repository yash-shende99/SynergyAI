'use client';
import { useState } from 'react';
import { MonteCarloSimulation } from '../../../../types';
import ControlPanel from './ControlPanel';
import ResultsPanel from './ResultsPanel';
import ActionFooter from './ActionFooter';
import WorkspaceHeader from './WorkspaceHeader';

// In a real app, this would be fetched based on the [simulationId] param
const initialSimulation: MonteCarloSimulation = { 
  id: 'sim-1', name: 'Helios - Base Case', projectName: 'Project Helios', summary: '', 
  variables: { 
    revenueGrowth: 10, 
    ebitdaMargin: 30, 
    costOfCapital: 9, 
    iterations: 10000, 
    distribution: 'Normal' 
  } 
};

type SimState = 'idle' | 'running' | 'complete';

export default function MonteCarloWorkspace() {
  const [simulation, setSimulation] = useState(initialSimulation);
  const [simState, setSimState] = useState<SimState>('idle');
  const [progress, setProgress] = useState(0);

  const handleRun = () =>  {
    setSimState('running');
    setProgress(0);
    // Simulate the run with an interval
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setSimState('complete');
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };
  const handleSave = () => alert(`SAVING: ${simulation.name}`);
  const handleReset = () => setSimulation(initialSimulation);

  return (
    <div className="flex flex-col h-full">
      <WorkspaceHeader simulation={simulation} onSave={handleSave} onReset={handleReset}/>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 mt-6">
        <div className="lg:col-span-1">
          <ControlPanel 
            simulation={simulation}
            setSimulation={setSimulation}
            simState={simState}
            progress={progress}
            onRunSimulation={handleRun}
          />
        </div>
        <div className="lg:col-span-2">
          <ResultsPanel simState={simState} />
        </div>
      </div>
      <ActionFooter />
    </div>
  );
}