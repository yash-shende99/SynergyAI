'use client';

import { useState, useEffect } from 'react';
import { Scenario } from '../../../../../../../types';
import ScenarioHeader from '../../../../../../../components/features/valuation/scenarios/ScenarioHeader';
import ScenarioInputPanel from '../../../../../../../components/features/valuation/scenarios/ScenarioInputPanel';
import ScenarioVisualizationPanel from '../../../../../../../components/features/valuation/scenarios/ScenarioVisualizationPanel';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '../../../../../../../lib/supabaseClient';

const initialScenario: Scenario = { 
  id: 'scen-new', 
  name: 'New Scenario', 
  projectId: '',
  projectName: '', 
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
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const scenarioId = params.scenarioId as string;

  useEffect(() => {
    if (projectId) {
      setScenario(prev => ({
        ...prev,
        projectId,
        projectName: `Project ${projectId}`
      }));
      
      if (scenarioId && scenarioId !== 'new') {
        fetchScenario(scenarioId);
      }
    }
  }, [projectId, scenarioId]);

  const fetchScenario = async (id: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`http://localhost:8000/api/projects/${projectId}/scenarios/${id}`, {
        headers: { 
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const scenarioData = await response.json();
        setScenario({
          id: scenarioData.id,
          name: scenarioData.name,
          projectId: scenarioData.project_id,
          projectName: `Project ${scenarioData.project_id}`,
          summary: scenarioData.summary || '',
          variables: scenarioData.variables
        });
      } else {
        throw new Error('Failed to fetch scenario');
      }
    } catch (err) {
      console.error('Failed to fetch scenario:', err);
      setError('Failed to load scenario');
    }
  };

  const handleSave = async () => {
    if (!scenario.name.trim()) {
      setError('Please enter a scenario name');
      return;
    }

    setIsSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Not authenticated");
      }

      const saveData = {
        name: scenario.name,
        variables: scenario.variables,
        summary: scenario.summary
      };

      let url: string;
      let method: string;

      if (scenario.id === 'scen-new') {
        url = `http://localhost:8000/api/projects/${projectId}/scenarios`;
        method = 'POST';
      } else {
        url = `http://localhost:8000/api/projects/${projectId}/scenarios/${scenario.id}`;
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
        throw new Error(errorData.detail || 'Failed to save scenario');
      }
      
      const savedScenario = await response.json();
      
      // Update scenario with saved data
      setScenario(prev => ({ 
        ...prev, 
        id: savedScenario.id,
        name: savedScenario.name 
      }));
      
      // Redirect to the saved scenario URL
      if (scenario.id === 'scen-new') {
        router.push(`/dashboard/project/${projectId}/valuation/scenarios/${savedScenario.id}`);
      }
      
      // Show success message
      alert('Scenario saved successfully!');
      
    } catch (err: any) {
      console.error('Failed to save scenario:', err);
      setError(err.message || 'Failed to save scenario');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleReset = () => {
    setScenario({
      ...initialScenario,
      projectId,
      projectName: `Project ${projectId}`
    });
    setError('');
  };

  const handleNameChange = (newName: string) => {
    setScenario(prev => ({
      ...prev,
      name: newName
    }));
  };

  return (
    <div className="space-y-6">
      <ScenarioHeader 
        scenario={scenario} 
        onSave={handleSave} 
        onReset={handleReset}
        onNameChange={handleNameChange}
        isSaving={isSaving}
      />
      
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