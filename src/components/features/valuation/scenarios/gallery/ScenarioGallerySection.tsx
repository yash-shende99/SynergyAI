import { useState } from 'react';
import { Scenario } from '../../../../../types';
import AddScenarioCard from './AddScenarioCard';
import ScenarioCard from './ScenarioCard';

// Mock data for the gallery
const mockScenarios: Scenario[] = [
  { id: 'scen-1', name: 'Aggressive Growth Case', projectName: 'Project Helios', summary: 'Revenue +15%, COGS -5%', variables: { revenueChange: 15, cogsChange: -5, taxRate: 25, discountRate: 10 } },
  { id: 'scen-2', name: 'Conservative Outlook', projectName: 'Project Helios', summary: 'Revenue +5%, COGS +2%', variables: { revenueChange: 5, cogsChange: 2, taxRate: 25, discountRate: 10 } },
  { id: 'scen-3', name: 'Worst Case Scenario', projectName: 'Project Neptune', summary: 'Revenue -10%, COGS +10%', variables: { revenueChange: -10, cogsChange: 10, taxRate: 30, discountRate: 12 } },
];

const ScenarioGallerySection = () => {
  const [scenarios, setScenarios] = useState(mockScenarios);

  const handleDelete = (id: string) => {
    setScenarios(scenarios.filter(s => s.id !== id));
    console.log(`DELETED: Scenario with id ${id}`);
  };

  const handleDuplicate = (id: string) => {
    const original = scenarios.find(s => s.id === id);
    if(original) {
        const newScenario = { ...original, id: `scen-${Date.now()}`, name: `${original.name} (Copy)` };
        setScenarios([...scenarios, newScenario]);
        console.log(`DUPLICATED: Scenario with id ${id}`);
    }
  };

  return (
    <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Saved Scenarios</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AddScenarioCard />
            {scenarios.map(scenario => (
                <ScenarioCard 
                    key={scenario.id} 
                    scenario={scenario} 
                    onDelete={() => handleDelete(scenario.id)}
                    onDuplicate={() => handleDuplicate(scenario.id)}
                />
            ))}
        </div>
    </div>
  );
};

export default ScenarioGallerySection;