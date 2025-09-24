'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { TargetCompanyRiskProfile } from '../../../../../types';
import { Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from '../../../../../lib/supabaseClient';
import RiskOverview from '../../../../../components/features/analytics/risk/RiskOverview';
import TopRisksPanel from '../../../../../components/features/analytics/risk/TopRisksPanel';

export default function AnalyticsRiskPage() {
  const [riskProfile, setRiskProfile] = useState<TargetCompanyRiskProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const params = useParams();
  const projectId = params.projectId as string;

  useEffect(() => {
    async function fetchRiskProfile() {
      if (!projectId) return;
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setIsLoading(false); return; }
      
      try {
        const response = await fetch(`http://localhost:8000/api/projects/${projectId}/risk_profile`, {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail || "Failed to fetch risk profile");
        }
        const data = await response.json();
        setRiskProfile(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchRiskProfile();
  }, [projectId]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>;
  }

  if (error || !riskProfile) {
    return <div className="flex flex-col justify-center items-center h-full text-red-400"><AlertTriangle className="h-8 w-8 mb-2"/><p className="font-semibold">Error Loading Risk Profile</p><p className="text-sm text-secondary">{error || "An unknown error occurred."}</p></div>;
  }

  return (
    <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white">AI-Generated Risk Profile for {riskProfile.name}</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TopRisksPanel topRisks={riskProfile.topRisks} />
          </div>
          <div className="lg:col-span-1">
            <RiskOverview riskProfile={riskProfile} />
          </div>
        </div>
    </div>
  );
}