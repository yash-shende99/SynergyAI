'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../../components/features/layout/Sidebar';
import FeatureHeader from '../../components/features/layout/FeatureHeader';
import { usePathname } from 'next/navigation';
import { featureConfig, FeatureKey } from '../../types';
import { useWatchlistStore } from '../../store/watchlistStore'; // <-- Import the store

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  
  const getActiveFeature = (): FeatureKey => {
    const pathParts = pathname.split('/');
    const feature = pathParts[2];

    if (feature && feature in featureConfig) {
      return feature as FeatureKey;
    }
    if (pathname === '/dashboard') {
      return 'dashboard';
    }
    return 'dashboard'; // Fallback
  };
  
  // --- THIS IS THE CORRECTED LOGIC ---
   const getActiveSubFeature = () => {
    const currentFeatureKey = getActiveFeature();
    const subFeatures = featureConfig[currentFeatureKey].subFeatures;

    // Find the sub-feature whose 'href' is the longest possible prefix
    // of the current browser URL. This correctly handles nested routes.
    let bestMatch: { name: string; href: string } | null = null;
    for (const sf of subFeatures) {
      if (pathname.startsWith(sf.href)) {
        if (!bestMatch || sf.href.length > bestMatch.href.length) {
          bestMatch = sf;
        }
      }
    }
    
    // Return the name of the best matching sub-feature, or null if no match.
    return bestMatch ? bestMatch.name.toLowerCase() : null;
  };
  // --- END OF FIX ---
  
  const activeFeature = getActiveFeature();
  const activeSubFeature = getActiveSubFeature();
  const config = featureConfig[activeFeature]; 

  const [_, setActiveFeature] = useState(activeFeature);

  useEffect(() => {
    useWatchlistStore.getState().initializeWatchlists(); // Make sure this matches the function name in your store
  }, []);
  
  return (
    <div className="flex h-screen bg-background text-white overflow-hidden font-sans p-4">
      <Sidebar 
        activeFeature={activeFeature} 
        setActiveFeature={setActiveFeature}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        
        <FeatureHeader 
          title={config.title} 
          subFeatures={config.subFeatures} 
          activeSubFeature={activeSubFeature} 
          onMenuClick={() => setIsSidebarOpen(true)}
        />
        
        <main className="flex-1 overflow-y-auto p-4 ml-10 sm:p-6 lg:p-8 bg-secondarySurface rounded-3xl ">
          {children}
        </main>
      </div>
    </div>
  );
}

