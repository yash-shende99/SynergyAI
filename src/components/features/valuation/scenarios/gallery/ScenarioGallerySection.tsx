'use client';

import { useState, useEffect } from 'react';
import { Scenario } from '../../../../../types';
import AddScenarioCard from './AddScenarioCard';
import ScenarioCard from './ScenarioCard';
import { supabase } from '../../../../../lib/supabaseClient';
import { Loader2, AlertTriangle } from 'lucide-react';

interface GalleryProps {
  projectId: string;
}

const ScenarioGallerySection: React.FC<GalleryProps> = ({ projectId }) => {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchScenarios();
  }, [projectId]);

  const fetchScenarios = async () => {
    setIsLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      setError('Not authenticated');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/projects/${projectId}/scenarios`, {
        headers: { 
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch scenarios: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Adapt the data to match our frontend types
      const adaptedScenarios = data.map((item: any) => ({
        id: item.id,
        name: item.name,
        projectId: item.project_id,
        projectName: `Project ${item.project_id}`,
        summary: item.summary || '',
        variables: item.variables
      }));
      
      setScenarios(adaptedScenarios);
      setError('');
    } catch (err: any) {
      console.error('Failed to fetch scenarios:', err);
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

      const response = await fetch(`http://localhost:8000/api/projects/${projectId}/scenarios/${id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete scenario');
      }
      
      setScenarios(prev => prev.filter(s => s.id !== id));
      setError('');
    } catch (err: any) {
      console.error('Failed to delete scenario:', err);
      setError(err.message);
    }
  };

  const handleDuplicate = async (scenario: Scenario) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Not authenticated');
        return;
      }

      const response = await fetch(`http://localhost:8000/api/projects/${projectId}/scenarios`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${session.access_token}` 
        },
        body: JSON.stringify({
          name: `${scenario.name} (Copy)`,
          variables: scenario.variables,
          summary: scenario.summary
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to duplicate scenario');
      }
      
      const newScenario = await response.json();
      setScenarios(prev => [{
        id: newScenario.id,
        name: newScenario.name,
        projectId: newScenario.project_id,
        projectName: `Project ${newScenario.project_id}`,
        summary: newScenario.summary || '',
        variables: newScenario.variables
      }, ...prev]);
      setError('');
    } catch (err: any) {
      console.error('Failed to duplicate scenario:', err);
      setError(err.message);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Scenario Analysis</h2>
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Scenario Analysis</h2>
        <div className="flex flex-col justify-center items-center h-40 text-red-400">
          <AlertTriangle className="h-8 w-8 mb-2" />
          <p>{error}</p>
          <button 
            onClick={fetchScenarios}
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
      <h2 className="text-2xl font-bold text-white">Scenario Analysis</h2>
      
      {error && (
        <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-4 text-red-400">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AddScenarioCard projectId={projectId} />
        {scenarios.map(scenario => (
          <ScenarioCard 
            key={scenario.id} 
            scenario={scenario}
            projectId={projectId}
            onDelete={() => handleDelete(scenario.id)}
            onDuplicate={() => handleDuplicate(scenario)}
          />
        ))}
      </div>
      
      {scenarios.length === 0 && !error && (
        <div className="text-center py-12 text-secondary">
          <p>No scenarios yet. Create your first scenario to get started.</p>
        </div>
      )}
    </div>
  );
};

export default ScenarioGallerySection;