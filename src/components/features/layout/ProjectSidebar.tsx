'use client';
import { FC, useState, useEffect } from 'react';
import Link from 'next/link';
import { projectNavItems } from '../../../lib/navConfig';
import { Bell, Settings, LogOut, X, Home } from 'lucide-react';
import synergyLogo from '@/app/../../public/synergy-logo.png';
import { supabase } from '../../../lib/supabaseClient';

interface ProjectSidebarProps {
  projectId: string;
  activeFeatureId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface ProjectUserProfile {
  id: string;
  name: string;
  email: string;
  project_role: string;
  avatar_url?: string;
}

const useProjectUserProfile = (projectId: string) => {
  const [userProfile, setUserProfile] = useState<ProjectUserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjectUserProfile = async () => {
      if (!projectId) return;

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setLoading(false);
          return;
        }

        // Call the FastAPI backend directly
        const response = await fetch(`http://localhost:8000/api/projects/${projectId}/user-profile`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('🔍 Project profile response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('🔍 Project profile data received:', data);
          setUserProfile(data);
        } else {
          console.error('Failed to fetch project profile:', response.status, response.statusText);
          const errorText = await response.text();
          console.error('Error details:', errorText);
        }
      } catch (error) {
        console.error('Failed to fetch project user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectUserProfile();
  }, [projectId]);

  return { userProfile, loading };
};

const ProjectSidebar: FC<ProjectSidebarProps> = ({ projectId, activeFeatureId, isOpen, onClose }) => {
  const projectName = "Helios";
  const { userProfile, loading } = useProjectUserProfile(projectId);

  // Filter out notifications and settings from main nav since they're in the bottom section
  const mainNavItems = projectNavItems.filter(item =>
    item.id !== 'notifications' && item.id !== 'settings'
  );

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <>
      <div onClick={onClose} className={`fixed inset-0 bg-black/60 z-30 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} />
      <aside className={`fixed lg:relative top-0 left-0 h-full w-64 flex-shrink-0 flex flex-col backdrop-blur-xl rounded-3xl z-40 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>

        {/* Header */}
        <div className="p-4 h-16 flex items-center justify-between">
          <div className="bg-secondarySurface rounded-full px-4 py-2 border border-border flex items-center space-x-2">
            <img src={synergyLogo.src} alt="SynergyAI" className="h-8 w-8 bg-secondarySurface" />
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">SynergyAI</h1>
              <p className="text-xs text-secondary -mt-1">Project Mode</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-1 text-secondary hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Project Info & Back to Dashboard */}
        <div className="p-2 bg-secondarySurface rounded-t-3xl">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm text-secondary hover:text-white p-2 mb-2 rounded-xl hover:bg-surface transition-colors"
          >
            <Home size={16} /> Back to Dashboard
          </Link>
          <div className="p-2">
            <h2 className="font-bold text-white truncate">Project: {projectName}</h2>
            <p className="text-xs text-secondary mt-1">Acquisition of SolarTech Inc.</p>
          </div>
        </div>

        {/* Project Navigation Items (excluding notifications/settings) */}
        <nav className="flex-1 p-2 space-y-1 bg-secondarySurface overflow-y-auto">
          {mainNavItems.map((item) => (
            <Link
              href={`/dashboard/project/${projectId}${item.href}`}
              key={item.id}
              onClick={() => window.innerWidth < 1024 && onClose()}
            >
              <button className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${activeFeatureId === item.id
                ? 'border-primary border-l-4 text-white'
                : 'text-secondary hover:bg-surface hover:text-white'
                }`}>
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </button>
            </Link>
          ))}
        </nav>

        {/* Bottom Section - Only Notifications and Settings */}
        <div className="p-2 border-t bg-secondarySurface rounded-b-3xl border-border">
          {/* Notifications */}
          <Link href={`/dashboard/project/${projectId}/notifications`}>
            <button className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeFeatureId === 'project-notifications'
              ? 'bg-primary/20 text-primary'
              : 'text-secondary hover:bg-surface'
              }`}>
              <Bell className="h-5 w-5" />
              <span>Project Notifications</span>
            </button>
          </Link>

          {/* Settings */}
          <Link href={`/dashboard/project/${projectId}/settings`}>
            <button className={`w-full flex items-center gap-3 px-3 py-2 mt-1 rounded-md text-sm font-medium transition-colors ${activeFeatureId === 'project-settings'
              ? 'bg-primary/20 text-primary'
              : 'text-secondary hover:bg-surface'
              }`}>
              <Settings className="h-5 w-5" />
              <span>Project Settings</span>
            </button>
          </Link>

          {/* User Profile */}
          <div className="p-2 mt-2 border-t border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                {userProfile ? (
                  <span className="text-sm font-medium text-white">
                    {userProfile.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </span>
                ) : (
                  <span className="text-sm font-medium text-white">US</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {loading ? 'Loading...' : userProfile?.name || 'User'}
                </p>
                <p className="text-xs text-secondary truncate">
                  {loading ? 'loading...' : userProfile?.project_role || 'Project Member'}
                </p>
              </div>

              {/* Global Settings Button */}
              <Link href="/dashboard/settings">
                <button className="p-1 text-secondary hover:text-white transition-colors" title="Global Settings">
                  <Settings size={16} />
                </button>
              </Link>
              <button 
                className="p-1 text-secondary hover:text-white"
                onClick={handleLogout}
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default ProjectSidebar;