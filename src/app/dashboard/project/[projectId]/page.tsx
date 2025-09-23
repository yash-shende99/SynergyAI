// app/dashboard/project/[projectId]/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Project } from '../../../../types';
import { Loader2 } from 'lucide-react';
import StatusTracker from '../../../../components/features/project/StatusTracker';
import KeyMetricCard from '../../../../components/features/project/KeyMetricCard';
import NextActionsPanel from '../../../../components/features/project/NextActionsPanel';
import TeamMembersPanel from '../../../../components/features/project/TeamMembersPanel';

const mockProject: Project = {
  id: 'proj-123',
  name: 'Acquisition of SolarTech Inc.',
  status: 'Diligence' as const,
  targetCompany: { 
    id: 'cin-123', 
    name: 'SolarTech Inc.', 
    logoUrl: '...', 
    sector: 'Renewable Energy', 
    location: 'Bengaluru, Karnataka', 
    revenue: 5000, 
    employees: 1200 
  },
  team: [
    {
      name: 'Yash Shende', 
      avatarUrl: 'https://placehold.co/32x32/E2E8F0/111827?text=YS',
      id: '1',
      email: 'yash@example.com',
      role: 'Admin'
    },
    {
      name: 'Priya Gupta', 
      avatarUrl: 'https://placehold.co/32x32/FBCFE8/831843?text=PG',
      id: '2',
      email: 'priya@example.com',
      role: 'Admin'
    }
  ]
};

export default function ProjectHomePage() {
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams();
  const projectId = params.projectId as string;

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setProject(mockProject);
      setIsLoading(false);
    }, 1000);
  }, [projectId]);

  if (isLoading || !project) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary"/>
      </div>
    );
  }

  return (
    <div className=" space-y-6">
      {/* Project Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">{project.name}</h1>
          <p className="text-secondary mt-1">Target: {project.targetCompany.name}</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-secondary">Project ID: {projectId}</div>
          <div className="text-xs text-secondary mt-1">Last updated: Today</div>
        </div>
      </div>
      
      {/* Status Tracker */}
      <StatusTracker currentStatus={project.status} />
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KeyMetricCard title="AI Risk Score" value="68" status="Moderate" color="text-amber-400" />
        <KeyMetricCard title="Synergy Score" value="72" status="High Potential" color="text-blue-400" />
        <KeyMetricCard title="Valuation Range" value="₹1.2B - ₹1.5B" status="Based on DCF" color="text-white" />
        <KeyMetricCard title="AI Recommendation" value="BUY" status="85% Confidence" color="text-green-400" />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <NextActionsPanel />
        </div>
        <div>
          <TeamMembersPanel team={project.team} />
        </div>
      </div>
    </div>
  );
}