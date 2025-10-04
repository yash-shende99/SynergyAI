'use client';
import { useState } from 'react';
import { usePathname, useParams } from 'next/navigation';
import ProjectSidebar from './ProjectSidebar';
import FeatureHeader from './FeatureHeader';
import { featureConfig, projectNavItems, findProjectActiveFeature } from '../../../lib/navConfig';
import {Bell, Settings} from 'lucide-react';

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const params = useParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const projectId = params.projectId as string;
  
  // Fix: Use the correct base path without duplication
  const baseHref = `/dashboard/project/${projectId}`;
const extendedProjectNavItems = [
    ...projectNavItems,
    { id: 'notifications', name: 'Notifications', href: '/project-notifications', icon: Bell },
    { id: 'settings', name: 'Project Settings', href: '/project-settings', icon: Settings }
  ];
  
const activeFeature = findProjectActiveFeature(pathname, projectId);
  const config = featureConfig[activeFeature.id] || {};

  console.log('ProjectLayout - Pathname:', pathname);
  console.log('ProjectLayout - Active Feature:', activeFeature);
  console.log('ProjectLayout - Config:', config);
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