'use client';

import { FC, useState, useEffect } from 'react';
import { SynergyProfile, Company } from '../../../../../types';
import CompanySelection from './CompanySelection';
import SynergyWorkspace from '../SynergyWorkspace';

// In a real app, this data would be fetched from the database
const mockCompanies: Company[] = [
  { id: 'comp-1', name: 'Reliance Industries', logoUrl: 'https://logo.clearbit.com/ril.com', sector: 'Conglomerate', location: 'Mumbai', revenue: 974864, employees: 389414 },
  { id: 'comp-2', name: 'Delhivery', logoUrl: 'https://logo.clearbit.com/delhivery.com', sector: 'Logistics', location: 'Gurgaon', revenue: 6800, employees: 65000 },
  { id: 'comp-3', name: 'Zomato', logoUrl: 'https://logo.clearbit.com/zomato.com', sector: 'Food Tech', location: 'Gurgaon', revenue: 7000, employees: 5000 },
  { id: 'comp-4', name: 'Freshworks', logoUrl: 'https://logo.clearbit.com/freshworks.com', sector: 'SaaS', location: 'Chennai', revenue: 4000, employees: 5500 },
];
const existingProfile: SynergyProfile = { id: 'syn-1', name: 'Reliance + Delhivery Analysis', acquirer: mockCompanies[0], target: mockCompanies[1], summary: '', variables: { costReduction: 12, revenueGrowth: 8, integrationCosts: 50, timeToRealize: 3 } };

interface SynergyCreatorProps {
  synergyId: string;
}

const SynergyCreator: FC<SynergyCreatorProps> = ({ synergyId }) => {
  const [profile, setProfile] = useState<SynergyProfile | null>(null);
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (synergyId === 'new') {
      setStep(1); // Start at company selection for a new profile
    } else {
      // If editing an existing profile, fetch it and jump to the workspace
      setProfile(existingProfile);
      setStep(2);
    }
  }, [synergyId]);

  const handleStartModeling = (acquirer: Company, target: Company) => {
    setProfile({
      id: `syn-${Date.now()}`,
      name: `${acquirer.name} + ${target.name} Synergy`,
      acquirer: acquirer,
      target: target,
      summary: '',
      variables: { costReduction: 10, revenueGrowth: 5, integrationCosts: 20, timeToRealize: 3 }, // AI Defaults
    });
    setStep(2);
  };
  
  if (step === 1) {
    return <CompanySelection companies={mockCompanies} onStartModeling={handleStartModeling} />;
  }

  if (step === 2 && profile) {
    return <SynergyWorkspace profile={profile} setProfile={setProfile} />;
  }

  return <div>Loading...</div>; // Or a proper loading skeleton
};
export default SynergyCreator;