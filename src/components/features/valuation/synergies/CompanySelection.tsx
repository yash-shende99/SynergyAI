'use client';

import { FC, useState } from 'react';
import { Company } from '../../../../types';
import {Button} from '../../../ui/button';
import { ArrowRight, Search, ArrowLeft } from 'lucide-react'; // <-- 1. Import ArrowLeft
import Link from 'next/link'; // <-- 2. Import Link

interface CompanySelectionProps {
  companies: Company[];
  onStartModeling: (acquirer: Company, target: Company) => void;
}

const CompanySelection: FC<CompanySelectionProps> = ({ companies, onStartModeling }) => {
  const [acquirer, setAcquirer] = useState<Company | null>(null);
  const [target, setTarget] = useState<Company | null>(null);

  // In a real app, this would be a dynamic search
  const acquirerSuggestions = companies.slice(0, 2);
  const targetSuggestions = companies.slice(2, 4);
  
  return (
    <div className="max-w-4xl mx-auto p-8 rounded-xl border border-border bg-surface/50">
      <h2 className="text-2xl font-bold text-white text-center">Model New Synergy</h2>
      <p className="text-secondary text-center mt-1">Select an acquirer and a target company to begin analysis.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {/* Acquirer Panel */}
        <div>
          <label className="text-sm font-semibold text-white">Acquirer</label>
          <div className="p-3 mt-2 bg-background/50 rounded-lg border border-border">
             <div className="relative"><Search size={16} className="absolute left-2 top-1/2 -translate-y-1/2 text-secondary"/><input type="text" placeholder="Search acquirer..." className="w-full bg-surface/50 pl-8 p-1.5 rounded-md text-sm"/></div>
             <div className="mt-2 space-y-1">{acquirerSuggestions.map(c => <button key={c.id} onClick={() => setAcquirer(c)} className={`w-full text-left p-2 rounded-md text-sm ${acquirer?.id === c.id ? 'bg-primary/20 text-primary' : 'hover:bg-surface'}`}>{c.name}</button>)}</div>
          </div>
        </div>
        {/* Target Panel */}
        <div>
          <label className="text-sm font-semibold text-white">Target</label>
           <div className="p-3 mt-2 bg-background/50 rounded-lg border border-border">
             <div className="relative"><Search size={16} className="absolute left-2 top-1/2 -translate-y-1/2 text-secondary"/><input type="text" placeholder="Search target..." className="w-full bg-surface/50 pl-8 p-1.5 rounded-md text-sm"/></div>
             <div className="mt-2 space-y-1">{targetSuggestions.map(c => <button key={c.id} onClick={() => setTarget(c)} className={`w-full text-left p-2 rounded-md text-sm ${target?.id === c.id ? 'bg-primary/20 text-primary' : 'hover:bg-surface'}`}>{c.name}</button>)}</div>
          </div>
        </div>
      </div>

      {/* --- THIS IS THE FIX --- */}
      {/* 3. The container is now a flexbox to position the buttons */}
      <div className="mt-8 flex justify-between items-center">
        {/* 4. The new Back button, wrapped in a Link */}
        <Link href="/dashboard/valuation/synergies">
            <Button variant="secondary" size="sm">
                <ArrowLeft size={16} className="mr-2"/>
                Back
            </Button>
        </Link>
        
        {/* The primary action button is on the right */}
        <Button onClick={() => onStartModeling(acquirer!, target!)} disabled={!acquirer || !target} size="default">
          Analyze Synergies <ArrowRight size={16} className="ml-2"/>
        </Button>
      </div>
    </div>
  );
};
export default CompanySelection;