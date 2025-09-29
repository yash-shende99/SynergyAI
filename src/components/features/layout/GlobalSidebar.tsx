'use client';
import { FC, useState, useEffect } from 'react';
import Link from 'next/link';
import { globalNavItems } from '../../../lib/navConfig';
import { Bell, Settings, LogOut, X } from 'lucide-react';
import synergyLogo from '@/app/../../public/synergy-logo.png';
import { supabase } from '../../../lib/supabaseClient';

interface GlobalSidebarProps {
  activeFeatureId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
}

const useUserProfile = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('🔍 Session data:', session);
        
        if (!session) {
          console.log('❌ No session found');
          setLoading(false);
          return;
        }

        // Call the FastAPI backend with proper error handling
        const response = await fetch('http://localhost:8000/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include' // Important for cookies if using them
        });
        
        console.log('🔍 Profile response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Profile data received:', data);
          setUserProfile(data);
        } else {
          console.error('❌ Failed to fetch user profile:', response.status, response.statusText);
          // Try to get more error details
          try {
            const errorData = await response.json();
            console.error('Error details:', errorData);
          } catch (e) {
            const errorText = await response.text();
            console.error('Error text:', errorText);
          }
          
          // Set fallback user data
          setUserProfile({
            id: session.user.id,
            name: session.user.user_metadata?.full_name || 'User',
            email: session.user.email || 'user@email.com'
          });
        }
      } catch (error) {
        console.error('❌ Network error fetching user profile:', error);
        // Set basic fallback data
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUserProfile({
            id: session.user.id,
            name: session.user.user_metadata?.full_name || 'User',
            email: session.user.email || 'user@email.com'
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  return { userProfile, loading };
};

const GlobalSidebar: FC<GlobalSidebarProps> = ({ activeFeatureId, isOpen, onClose }) => {
  const { userProfile, loading } = useUserProfile();
  
  // Filter out notifications and settings from main nav since they're in the bottom section
  const mainNavItems = globalNavItems.filter(item => 
    item.id !== 'notifications' && item.id !== 'settings'
  );

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // Optional: redirect to login page after logout
    window.location.href = '/login';
  };

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!userProfile?.name) return 'US';
    return userProfile.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <div onClick={onClose} className={`fixed inset-0 bg-black/60 z-30 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} />
      <aside className={`fixed lg:relative top-0 left-0 h-full w-64 flex-shrink-0 flex flex-col backdrop-blur-xl rounded-3xl z-40 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        
        {/* Header */}
        <div className="p-4 h-16 flex items-center justify-between">
          <div className="bg-secondarySurface rounded-full px-4 py-2 border border-border flex items-center space-x-2">
            <img src={synergyLogo.src} alt="SynergyAI" className="h-8 w-8 bg-secondarySurface" />
            <h1 className="text-xl font-bold text-white tracking-tight">SynergyAI</h1>
          </div>
          <button onClick={onClose} className="lg:hidden p-1 text-secondary hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Navigation Items (excluding notifications/settings) */}
        <nav className="flex-1 p-2 space-y-1 bg-secondarySurface rounded-t-3xl overflow-y-auto">
          {mainNavItems.map((item) => (
            <Link href={item.href} key={item.id}>
              <button className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeFeatureId === item.id 
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
          <Link href="/dashboard/notifications">
            <button className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeFeatureId === 'notifications'
                ? 'bg-primary/20 text-primary'
                : 'text-secondary hover:bg-surface'
            }`}>
              <Bell className="h-5 w-5" />
              <span>Notifications</span>
            </button>
          </Link>

          {/* Settings */}
          <Link href="/dashboard/settings">
            <button className={`w-full flex items-center gap-3 px-3 py-2 mt-1 rounded-md text-sm font-medium transition-colors ${
              activeFeatureId === 'settings'
                ? 'bg-primary/20 text-primary'
                : 'text-secondary hover:bg-surface'
            }`}>
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </button>
          </Link>

          {/* User Profile */}
          <div className="p-2 mt-2 border-t border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                {userProfile ? (
                  <span className="text-sm font-medium text-white">
                    {getUserInitials()}
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
                  {loading ? 'loading...' : userProfile?.email || 'user@email.com'}
                </p>
              </div>
              
              <button 
                className="p-1 text-secondary hover:text-white transition-colors"
                onClick={handleLogout}
                title="Logout"
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

export default GlobalSidebar;