'use client';

import { useState } from 'react';
import { MonteCarloSimulation } from '../../../../../types';
import AddSimulationCard from './AddSimulationCard';
import SimulationCard from './SimulationCard';

const mockSimulations: MonteCarloSimulation[] = [
  { 
    id: 'sim-1', 
    name: 'Helios - Base Case', 
    projectName: 'Project Helios', 
    summary: '10,000 iterations, Normal Distribution', 
    variables: { revenueGrowth: 10, ebitdaMargin: 30, costOfCapital: 9, iterations: 10000, distribution: 'Normal' } 
  },
  { 
    id: 'sim-2', 
    name: 'Neptune - High Volatility', 
    projectName: 'Project Neptune', 
    summary: '5,000 iterations, Lognormal Distribution', 
    variables: { revenueGrowth: 12, ebitdaMargin: 28, costOfCapital: 11, iterations: 5000, distribution: 'Lognormal' } 
  },
];


export default function MonteCarloGallerySection() {
  const [simulations, setSimulations] = useState(mockSimulations);

  const handleDelete = (id: string) => {
    setSimulations(simulations.filter(s => s.id !== id));
    alert(`DELETED: Simulation with id ${id}`);
  };

  const handleDuplicate = (id: string) => {
    const original = simulations.find(s => s.id === id);
    if(original) {
        const newSim = { ...original, id: `sim-${Date.now()}`, name: `${original.name} (Copy)` };
        setSimulations([...simulations, newSim]);
        alert(`DUPLICATED: Simulation with id ${id}`);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white">Monte Carlo Simulations</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AddSimulationCard />
        {simulations.map(sim => (
          <SimulationCard 
            key={sim.id} 
            simulation={sim}
            onDelete={() => handleDelete(sim.id)}
            onDuplicate={() => handleDuplicate(sim.id)}
          />
        ))}
      </div>
    </div>
  );
}