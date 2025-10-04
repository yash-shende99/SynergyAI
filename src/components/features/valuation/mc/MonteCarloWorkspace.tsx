// components/features/valuation/mc/MonteCarloWorkspace.tsx
'use client';
import { useState, useEffect } from 'react';
import { MonteCarloSimulation, MonteCarloResult, MonteCarloVariables } from '../../../../types';
import ControlPanel from './ControlPanel';
import ResultsPanel from './ResultsPanel';
import WorkspaceHeader from './WorkspaceHeader';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '../../../../lib/supabaseClient';

const initialSimulation: MonteCarloSimulation = { 
  id: 'sim-new', 
  name: 'New Simulation', 
  projectId: '', 
  projectName: '', 
  summary: '', 
  variables: { 
    revenueGrowth: 10, 
    ebitdaMargin: 30, 
    costOfCapital: 9, 
    iterations: 10000, 
    distribution: 'Normal' as const
  } 
};

export default function MonteCarloWorkspace() {
  const [simulation, setSimulation] = useState(initialSimulation);
  const [results, setResults] = useState<MonteCarloResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const simulationId = params.simulationId as string;

  useEffect(() => {
    if (projectId) {
      setSimulation(prev => ({
        ...prev,
        projectId,
        projectName: `Project ${projectId}`
      }));
      
      if (simulationId && simulationId !== 'new') {
        fetchSimulation(simulationId);
      }
    }
  }, [projectId, simulationId]);

  const fetchSimulation = async (id: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`http://localhost:8000/api/projects/${projectId}/simulations/${id}`, {
        headers: { 
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const simData = await response.json();
        setSimulation({
          id: simData.id,
          name: simData.name,
          projectId: simData.project_id,
          projectName: `Project ${simData.project_id}`,
          summary: '',
          variables: simData.variables,
          results_summary: simData.results_summary
        });
        if (simData.results_summary) {
          setResults(simData.results_summary);
        }
      } else {
        throw new Error('Failed to fetch simulation');
      }
    } catch (err) {
      console.error('Failed to fetch simulation:', err);
      setError('Failed to load simulation');
    }
  };

  const handleRun = async () => {
    setIsSimulating(true);
    setError('');
    setResults(null);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Not authenticated");
      }

      const response = await fetch(`http://localhost:8000/api/projects/${projectId}/simulations/run`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${session.access_token}` 
        },
        body: JSON.stringify({ 
          variables: simulation.variables 
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setResults(data);
      
    } catch (err: any) {
      console.error('Simulation error:', err);
      setError(err.message || 'Simulation failed');
    } finally {
      setIsSimulating(false);
    }
  };

  const handleSave = async () => {
    if (!simulation.name.trim()) {
      setError('Please enter a simulation name');
      return;
    }

    setIsSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Not authenticated");
      }

      const saveData = {
        name: simulation.name,
        variables: simulation.variables,
        results_summary: results
      };

      let url: string;
      let method: string;

      if (simulation.id === 'sim-new') {
        url = `http://localhost:8000/api/projects/${projectId}/simulations`;
        method = 'POST';
      } else {
        url = `http://localhost:8000/api/projects/${projectId}/simulations/${simulation.id}`;
        method = 'PUT';
      }

      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${session.access_token}` 
        },
        body: JSON.stringify(saveData)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to save simulation');
      }
      
      const savedSim = await response.json();
      
      // Update simulation with saved data
      setSimulation(prev => ({ 
        ...prev, 
        id: savedSim.id,
        name: savedSim.name 
      }));
      
      // Redirect to the saved simulation URL
      if (simulation.id === 'sim-new') {
        router.push(`/dashboard/project/${projectId}/valuation/mc/${savedSim.id}`);
      }
      
      // Show success message
      alert('Simulation saved successfully!');
      
    } catch (err: any) {
      console.error('Failed to save simulation:', err);
      setError(err.message || 'Failed to save simulation');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setSimulation({
      ...initialSimulation,
      projectId,
      projectName: `Project ${projectId}`
    });
    setResults(null);
    setError('');
  };

  const handleNameChange = (newName: string) => {
    setSimulation(prev => ({
      ...prev,
      name: newName
    }));
  };

  return (
    <div className="flex flex-col h-full">
      <WorkspaceHeader 
        simulation={simulation}
        onSave={handleSave}
        onReset={handleReset}
        onNameChange={handleNameChange}
        isSaving={isSaving}
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 mt-6">
        <div className="lg:col-span-1">
          <ControlPanel 
            simulation={simulation}
            setSimulation={setSimulation}
            simState={isSimulating ? 'running' : 'idle'}
            progress={0}
            onRunSimulation={handleRun}
          />
        </div>
        <div className="lg:col-span-2">
          <ResultsPanel 
            results={results} 
            isSimulating={isSimulating} 
            error={error} 
          />
        </div>
      </div>
    </div>
  );
}