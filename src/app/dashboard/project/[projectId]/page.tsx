// app/dashboard/project/[projectId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { RealMissionControlData, EnhancedProject, DealStatus } from '../../../../types';
import { Loader2, AlertTriangle, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../../../lib/supabaseClient';
import StatusTracker from '../../../../components/features/project/StatusTracker';
import KeyMetricCard from '../../../../components/features/project/KeyMetricCard';
import NextActionsPanel from '../../../../components/features/project/NextActionsPanel';
import TeamMembersPanel from '../../../../components/features/project/TeamMembersPanel';
import FinancialMetricsPanel from '../../../../components/features/project/FinancialMetricsPanel';
import RiskHealthPanel from '../../../../components/features/project/RiskHealthPanel';

export default function ProjectHomePage() {
  const [data, setData] = useState<RealMissionControlData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const params = useParams();
  const projectId = params.projectId as string;
  const [currentStatus, setCurrentStatus] = useState<DealStatus>('Sourcing');

  // Function to get fresh session token
  const getValidSession = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) {
      throw new Error('Not authenticated');
    }
    return session;
  };

  // Move fetchData outside of useEffect so it's accessible everywhere
  const fetchData = async () => {
    if (!projectId) return;
    setIsLoading(true);
    
    try {
      const session = await getValidSession();
      
      const response = await fetch(`http://localhost:8000/api/projects/${projectId}/mission_control`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        }
        const err = await response.json();
        throw new Error(err.detail || "Failed to fetch Mission Control data");
      }
      
      const missionData = await response.json();
      setData(missionData);
      // Set current status from the fetched data
      if (missionData.project?.status) {
        setCurrentStatus(missionData.project.status);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const handleStatusChange = async (newStatus: DealStatus) => {
    try {
      // Get fresh session token for each request
      const session = await getValidSession();
      
      const response = await fetch(`http://localhost:8000/api/projects/${projectId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          status: newStatus,
          reason: 'User clicked on status tracker'
        })
      });

      if (response.ok) {
        setCurrentStatus(newStatus);
        // Refresh the mission control data to get updated information
        await fetchData();
      } else {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        }
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update status');
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      // Show error message to user
      setError(error instanceof Error ? error.message : 'Failed to update status');
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (error || !data) {
    return (
      <div className="flex flex-col justify-center items-center h-full text-red-400">
        <AlertTriangle className="h-8 w-8 mb-2" />
        <p className="font-semibold">Error Loading Data</p>
        <p className="text-sm">{error || "Could not load the project dashboard."}</p>
        <button 
          onClick={() => {
            setError('');
            fetchData();
          }}
          className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/80 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const { project, keyMetrics, aiRecommendation, nextActions, riskIndicators } = data;
  const targetCompanyName = project.companies?.name || project.company_details?.name || 'Target Company';

  // Helper function to get recommendation color
  const getRecommendationColor = (rec: string) => {
    switch (rec?.toUpperCase()) {
      case 'BUY': return 'text-green-400';
      case 'HOLD': return 'text-amber-400';
      case 'SELL': return 'text-red-400';
      default: return 'text-white';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">{project.name}</h1>
          <p className="text-secondary mt-1">Target: {targetCompanyName}</p>
          {project.company_details?.industry?.sector && (
            <p className="text-sm text-slate-500 mt-1">
              Sector: {project.company_details.industry.sector}
              {project.company_details.industry.sub_sector && ` • ${project.company_details.industry.sub_sector}`}
            </p>
          )}
        </div>
        <div className="text-right">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
            aiRecommendation.recommendation === 'BUY' ? 'bg-green-500/20 text-green-400' :
            aiRecommendation.recommendation === 'HOLD' ? 'bg-amber-500/20 text-amber-400' :
            'bg-red-500/20 text-red-400'
          }`}>
            {aiRecommendation.recommendation === 'BUY' && <TrendingUp size={16} />}
            {aiRecommendation.recommendation === 'HOLD' && <AlertCircle size={16} />}
            {aiRecommendation.recommendation === 'SELL' && <AlertTriangle size={16} />}
            {aiRecommendation.recommendation} • {aiRecommendation.confidence} Confidence
          </div>
          <p className="text-xs text-slate-500 mt-1">Last updated: {new Date(data.lastUpdated).toLocaleTimeString()}</p>
        </div>
      </div>

      {/* Status Tracker */}
      <StatusTracker
        currentStatus={currentStatus}
        onStatusChange={handleStatusChange}
      />

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KeyMetricCard
          title="Risk Score"
          value={keyMetrics.dealHealth.riskScore}
          status={keyMetrics.dealHealth.riskLevel}
          color={keyMetrics.dealHealth.riskLevel === 'High' ? 'text-red-400' : keyMetrics.dealHealth.riskLevel === 'Medium' ? 'text-amber-400' : 'text-green-400'}
          icon={<AlertCircle className="h-5 w-5" />}
        />
        <KeyMetricCard
          title="Synergy Score"
          value={keyMetrics.dealHealth.synergyScore}
          status={`${keyMetrics.dealHealth.synergyValue} potential`}
          color="text-blue-400"
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <KeyMetricCard
          title="Valuation Range"
          value={keyMetrics.financial.valuation}
          status="Implied EV"
          color="text-white"
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <KeyMetricCard
          title="AI Recommendation"
          value={aiRecommendation.recommendation}
          status={`${aiRecommendation.confidence} Confidence`}
          color={getRecommendationColor(aiRecommendation.recommendation)}
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
      </div>

      {/* Detailed Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Financial Metrics */}
        <div>
          <FinancialMetricsPanel
            revenue={keyMetrics.financial.revenue}
            ebitdaMargin={keyMetrics.financial.ebitdaMargin}
            employees={keyMetrics.financial.employees}
            financialHealth={riskIndicators.financialHealth}
          />
        </div>

        {/* Risk & Health */}
        <div>
          <RiskHealthPanel
            riskScore={keyMetrics.dealHealth.riskScore}
            riskLevel={keyMetrics.dealHealth.riskLevel}
            criticalEvents={riskIndicators.criticalEvents}
            dealComplexity={riskIndicators.dealComplexity}
            taskCompletion={keyMetrics.execution.taskCompletion}
            milestoneProgress={keyMetrics.execution.milestoneProgress}
          />
        </div>

        {/* Next Actions */}
        <div>
          <NextActionsPanel tasks={nextActions} />
        </div>
      </div>

      {/* Team Members Panel - Moved outside the grid for better layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TeamMembersPanel team={project.team || []} />
        
        {/* AI Rationale - Moved to be side by side with team members */}
        <div className="p-6 rounded-xl border border-border bg-surface/50">
          <h3 className="text-lg font-bold text-white mb-3">AI Analysis</h3>
          <p className="text-sm text-slate-300 leading-relaxed">{aiRecommendation.rationale}</p>
        </div>
      </div>
    </div>
  );
}