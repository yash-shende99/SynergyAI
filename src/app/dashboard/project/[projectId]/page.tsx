// app/dashboard/project/[projectId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { RealMissionControlData, EnhancedProject, DealStatus, TargetCompanyRiskProfile, SynergyAiScore } from '../../../../types';
import { Loader2, AlertTriangle, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../../../lib/supabaseClient';
import StatusTracker from '../../../../components/features/project/StatusTracker';
import KeyMetricCard from '../../../../components/features/project/KeyMetricCard';
import NextActionsPanel from '../../../../components/features/project/NextActionsPanel';
import TeamMembersPanel from '../../../../components/features/project/TeamMembersPanel';
import FinancialMetricsPanel from '../../../../components/features/project/FinancialMetricsPanel';
import RiskHealthPanel from '../../../../components/features/project/RiskHealthPanel';

const ALL_STATUSES: DealStatus[] = ['Sourcing', 'Diligence', 'Negotiation', 'Completed'];


export default function ProjectHomePage() {
  const [data, setData] = useState<RealMissionControlData | null>(null);
  const [riskProfile, setRiskProfile] = useState<TargetCompanyRiskProfile | null>(null);
  const [synergyScore, setSynergyScore] = useState<SynergyAiScore | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const params = useParams();
  const projectId = params.projectId as string;
  const [currentStatus, setCurrentStatus] = useState<DealStatus>('Sourcing');

  const getValidSession = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) {
      throw new Error('Not authenticated');
    }
    return session;
  };

  const fetchRiskProfile = async () => {
    try {
      const session = await getValidSession();
      const response = await fetch(`http://localhost:8000/api/projects/${projectId}/risk_profile`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });

      if (response.ok) {
        const riskData = await response.json();
        setRiskProfile(riskData);
      }
    } catch (error) {
      console.error('Failed to fetch risk profile:', error);
    }
  };

  const fetchSynergyScore = async () => {
    try {
      const session = await getValidSession();
      const response = await fetch(`http://localhost:8000/api/projects/${projectId}/synergy_score`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });

      if (response.ok) {
        const synergyData = await response.json();
        setSynergyScore(synergyData);
      }
    } catch (error) {
      console.error('Failed to fetch synergy score:', error);
    }
  };

  const fetchProjectStatus = async () => {
    try {
      const session = await getValidSession();
      const response = await fetch(`http://localhost:8000/api/projects/${projectId}/status/current`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });

      if (response.ok) {
        const statusData = await response.json();
        if (statusData.status && ALL_STATUSES.includes(statusData.status as DealStatus)) {
          setCurrentStatus(statusData.status as DealStatus);
        }
      }
    } catch (error) {
      console.error('Failed to fetch project status:', error);
    }
  };

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

      if (missionData.project?.status && ALL_STATUSES.includes(missionData.project.status as DealStatus)) {
        setCurrentStatus(missionData.project.status as DealStatus);
      }

      // Fetch additional data in parallel
      await Promise.all([
        fetchRiskProfile(),
        fetchSynergyScore(),
        fetchProjectStatus() // Also fetch dedicated status
      ]);
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

  // Use actual risk and synergy scores from the dedicated endpoints
  const actualRiskScore = riskProfile?.overallScore || 50;
  const actualSynergyScore = synergyScore?.overallScore || 50;

  const riskLevel = actualRiskScore > 70 ? 'High' : actualRiskScore > 40 ? 'Medium' : 'Low';

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
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${aiRecommendation.recommendation === 'BUY' ? 'bg-green-500/20 text-green-400' :
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

      {/* Status Tracker - Read Only */}
      <StatusTracker currentStatus={currentStatus} />

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KeyMetricCard
          title="Risk Score"
          value={`${actualRiskScore}/100`}
          status={riskLevel}
          color={riskLevel === 'High' ? 'text-red-400' : riskLevel === 'Medium' ? 'text-amber-400' : 'text-green-400'}
          icon={<AlertCircle className="h-5 w-5" />}
        />
        <KeyMetricCard
          title="Synergy Score"
          value={`${actualSynergyScore}/100`}
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
            riskScore={`${actualRiskScore}/100`}
            riskLevel={riskLevel}
            criticalEvents={riskIndicators.criticalEvents}
            dealComplexity={riskIndicators.dealComplexity}
            taskCompletion={keyMetrics.execution.taskCompletion}
            milestoneProgress={keyMetrics.execution.milestoneProgress}
          />
        </div>

        {/* Next Actions */}
        <div>
          <NextActionsPanel tasks={nextActions} projectId={projectId} />
        </div>
      </div>

      {/* Team Members and AI Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TeamMembersPanel team={project.team || []} projectId={projectId} />

        {/* AI Analysis Card */}
        <div className="p-6 rounded-xl border border-border bg-surface/50">
          <h3 className="text-lg font-bold text-white mb-3">AI Analysis Brief</h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-white mb-2">Investment Thesis</h4>
              <p className="text-sm text-slate-300 leading-relaxed">
                {aiRecommendation.rationale || "AI analysis is processing the deal fundamentals. Key considerations include market position, financial performance, and strategic alignment with the acquirer's portfolio."}
              </p>
            </div>

            {synergyScore && (
              <div>
                <h4 className="text-sm font-medium text-white mb-2">Synergy Assessment</h4>
                <div className="space-y-2">
                  {synergyScore.subScores?.map((subScore, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="text-slate-300">{subScore.category}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{subScore.score}/100</span>
                        <div className="w-16 bg-slate-700 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${subScore.score}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {synergyScore.rationale && (
                  <p className="text-xs text-slate-400 mt-2">{synergyScore.rationale}</p>
                )}
              </div>
            )}

            {riskProfile && (
              <div>
                <h4 className="text-sm font-medium text-white mb-2">Risk Overview</h4>
                <div className="space-y-2">
                  {riskProfile.topRisks?.slice(0, 3).map((risk, index) => (
                    <div key={index} className="text-sm">
                      <p className="text-slate-300">• {risk.risk}</p>
                      <p className="text-xs text-slate-400 ml-4">Mitigation: {risk.mitigation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}