'use client';

import { useState } from 'react';
import Sidebar from '../../../components/features/layout/Sidebar';
import FeatureHeader from '../../../components/features/layout/FeatureHeader';

// This layout wraps ALL pages inside the /dashboard route
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // We will lift state up to this layout to control the active feature
  const [activeFeature, setActiveFeature] = useState('dashboard'); // Default to dashboard

  return (
    <div className="flex h-screen bg-background text-white overflow-hidden font-sans">
      {/* The main vertical sidebar on the left */}
      <Sidebar activeFeature={activeFeature} setActiveFeature={setActiveFeature} />

      {/* The main content area that flexes to fill the space */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* The horizontal feature-specific header strip */}
        <FeatureHeader activeFeature={activeFeature} />

        {/* The main component for the selected feature is rendered here */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
