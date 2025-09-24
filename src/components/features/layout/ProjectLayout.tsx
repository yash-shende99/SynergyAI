'use client';
import { useState } from 'react';
import { usePathname, useParams } from 'next/navigation';
import ProjectSidebar from './ProjectSidebar';
import FeatureHeader from './FeatureHeader';
import { featureConfig, projectNavItems, findActiveFeature } from '../../../lib/navConfig';

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const params = useParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const projectId = params.projectId as string;
  
  // Fix: Use the correct base path without duplication
  const baseHref = `/dashboard/project/${projectId}`;
  const activeFeature = findActiveFeature(pathname, projectNavItems, baseHref);
  const config = featureConfig[activeFeature.id] || {};

  // Debug: Log the paths to see what's happening
  console.log('Pathname:', pathname);
  console.log('BaseHref:', baseHref);
  console.log('SubFeatures:', config.subFeatures);

  return (
    <div className="flex h-screen bg-background text-white overflow-hidden font-sans p-4">
      <ProjectSidebar 
        projectId={projectId} 
        activeFeatureId={activeFeature.id} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <FeatureHeader 
          title={config.title || 'Project Workspace'} 
          subFeatures={config.subFeatures || []}
          onMenuClick={() => setIsSidebarOpen(true)}
          baseHref={baseHref}
        />
        <main className="flex-1 overflow-y-auto p-4 ml-10 sm:p-6 lg:p-8 bg-secondarySurface rounded-3xl">
          {children}
        </main>
      </div>
    </div>
  );
}