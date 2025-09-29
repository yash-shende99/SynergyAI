'use client';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import GlobalSidebar from './GlobalSidebar';
import FeatureHeader from './FeatureHeader';
import { featureConfig, findActiveFeature, globalNavItems } from '../../../lib/navConfig';
import { useWatchlistStore } from '../../../store/watchlistStore';
import {Bell, Settings} from 'lucide-react';

export default function GlobalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const completeNavItems = [
    ...globalNavItems,
    { id: 'notifications', name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
    { id: 'settings', name: 'Settings', href: '/dashboard/settings', icon: Settings }
  ];
  
  const activeFeature = findActiveFeature(pathname, completeNavItems);
  const config = featureConfig[activeFeature.id] || {};
  
  // Initialize watchlists
  useState(() => {
    useWatchlistStore.getState().initializeWatchlists();
  });

  return (
    <div className="flex h-screen bg-background text-white overflow-hidden font-sans p-4">
      <GlobalSidebar 
        activeFeatureId={activeFeature.id} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <FeatureHeader 
          title={config.title || 'Dashboard'} 
          subFeatures={config.subFeatures || []}
          onMenuClick={() => setIsSidebarOpen(true)}
          baseHref=""
        />
        <main className="flex-1 overflow-y-auto p-4 ml-10 sm:p-6 lg:p-8 bg-secondarySurface rounded-3xl">
          {children}
        </main>
      </div>
    </div>
  );
}