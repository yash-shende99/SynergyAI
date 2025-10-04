'use client';

import { useState, useEffect } from 'react';
import { MonteCarloSimulation } from '../../../../../types';
import AddSimulationCard from './AddSimulationCard';
import SimulationCard from './SimulationCard';
import { supabase } from '../../../../../lib/supabaseClient';
import { Loader2, AlertTriangle } from 'lucide-react';

interface GalleryProps {
  projectId: string;
}

const MonteCarloGallerySection: React.FC<GalleryProps> = ({ projectId }) => {
  const [simulations, setSimulations] = useState<MonteCarloSimulation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSimulations();
  }, [projectId]);

  const fetchSimulations = async () => {
    setIsLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      setError('Not authenticated');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/projects/${projectId}/simulations`, {
        headers: { 
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch simulations: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Adapt the data to match our frontend types
      const adaptedSimulations = data.map((item: any) => ({
        id: item.id,
        name: item.name,
        projectId: item.project_id,
        projectName: `Project ${item.project_id}`, // You might want to fetch actual project name
        summary: item.results_summary ? 
          `Mean: ₹${item.results_summary.meanValuation?.toFixed(2) || '0.00'} Cr` : 
          'No results yet',
        variables: item.variables,
        results_summary: item.results_summary,
        created_at: item.created_at,
        last_run_at: item.last_run_at
      }));
      
      setSimulations(adaptedSimulations);
      setError('');
    } catch (err: any) {
      console.error('Failed to fetch simulations:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Not authenticated');
        return;
      }

      const response = await fetch(`http://localhost:8000/api/projects/${projectId}/simulations/${id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete simulation');
      }
      
      setSimulations(prev => prev.filter(s => s.id !== id));
      setError('');
    } catch (err: any) {
      console.error('Failed to delete simulation:', err);
      setError(err.message);
    }
  };

  const handleDuplicate = async (simulation: MonteCarloSimulation) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Not authenticated');
        return;
      }

      const response = await fetch(`http://localhost:8000/api/projects/${projectId}/simulations`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${session.access_token}` 
        },
        body: JSON.stringify({
          name: `${simulation.name} (Copy)`,
          variables: simulation.variables,
          results_summary: simulation.results_summary
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to duplicate simulation');
      }
      
      const newSim = await response.json();
      setSimulations(prev => [newSim, ...prev]);
      setError('');
    } catch (err: any) {
      console.error('Failed to duplicate simulation:', err);
      setError(err.message);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Monte Carlo Simulations</h2>
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Monte Carlo Simulations</h2>
        <div className="flex flex-col justify-center items-center h-40 text-red-400">
          <AlertTriangle className="h-8 w-8 mb-2" />
          <p>{error}</p>
          <button 
            onClick={fetchSimulations}
            className="mt-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white">Monte Carlo Simulations</h2>
      
      {error && (
        <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-4 text-red-400">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AddSimulationCard projectId={projectId} />
        {simulations.map(sim => (
          <SimulationCard 
            key={sim.id} 
            simulation={sim}
            projectId={projectId}
            onDelete={() => handleDelete(sim.id)}
            onDuplicate={() => handleDuplicate(sim)}
          />
        ))}
      </div>
      
      {simulations.length === 0 && !error && (
        <div className="text-center py-12 text-secondary">
          <p>No simulations yet. Create your first simulation to get started.</p>
        </div>
      )}
    </div>
  );
};

export default MonteCarloGallerySection;