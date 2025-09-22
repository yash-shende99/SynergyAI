'use client';

import { useState } from 'react';
import { SynergyProfile, Company } from '../../../../../types'; 
import AddSynergyCard from './AddSynergyCard';
import SavedSynergyCard from './SavedSynergyCard';

// Mock data for the gallery
const mockCompanies: Company[] = [
  { id: 'comp-1', name: 'Reliance Industries', logoUrl: 'https://logo.clearbit.com/ril.com', sector: 'Conglomerate', location: 'Mumbai', revenue: 974864, employees: 389414 },
  { id: 'comp-2', name: 'Delhivery', logoUrl: 'https://logo.clearbit.com/delhivery.com', sector: 'Logistics', location: 'Gurgaon', revenue: 6800, employees: 65000 },
  { id: 'comp-3', name: 'Zomato', logoUrl: 'https://logo.clearbit.com/zomato.com', sector: 'Food Tech', location: 'Gurgaon', revenue: 7000, employees: 5000 },
  { id: 'comp-4', name: 'Freshworks', logoUrl: 'https://logo.clearbit.com/freshworks.com', sector: 'SaaS', location: 'Chennai', revenue: 4000, employees: 5500 },
];

const mockProfiles: SynergyProfile[] = [
  { id: 'syn-1', name: 'Reliance + Delhivery Analysis', acquirer: mockCompanies[0], target: mockCompanies[1], summary: '$50M Cost, $70M Revenue', variables: { costReduction: 12, revenueGrowth: 8, integrationCosts: 50, timeToRealize: 3 } },
  { id: 'syn-2', name: 'Zomato + Freshworks Potential', acquirer: mockCompanies[2], target: mockCompanies[3], summary: '$20M Cost, $100M Revenue', variables: { costReduction: 5, revenueGrowth: 15, integrationCosts: 80, timeToRealize: 4 } },
];

export default function SynergyGallerySection() {
  const [profiles, setProfiles] = useState(mockProfiles);

  const handleDelete = (id: string) => {
    setProfiles(profiles.filter(p => p.id !== id));
    alert(`DELETED: Synergy Profile with id ${id}`);
  };

  const handleDuplicate = (id: string) => {
    const original = profiles.find(p => p.id === id);
    if(original) {
        const newProfile = { ...original, id: `syn-${Date.now()}`, name: `${original.name} (Copy)` };
        setProfiles([...profiles, newProfile]);
        alert(`DUPLICATED: Synergy Profile with id ${id}`);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white">Synergy Models</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AddSynergyCard />
        {profiles.map(profile => (
          <SavedSynergyCard 
            key={profile.id} 
            profile={profile}
            onDelete={() => handleDelete(profile.id)}
            onDuplicate={() => handleDuplicate(profile.id)}
          />
        ))}
      </div>
    </div>
  );
}