'use client';
import { usePathname } from 'next/navigation';
import GlobalLayout from '../../components/features/layout/GlobalLayout';
import ProjectLayout from '../../components/features/layout/ProjectLayout';
import { useWatchlistStore } from '../../store/watchlistStore';
import { useEffect } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Check if we're on a project page
  const isProjectPage = pathname?.includes('/dashboard/project/');

  useEffect(() => {
    useWatchlistStore.getState().initializeWatchlists();
  }, []);

  if (isProjectPage) {
    return <ProjectLayout>{children}</ProjectLayout>;
  }
  
  return <GlobalLayout>{children}</GlobalLayout>;
}