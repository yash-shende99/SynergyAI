'use client';
import { FC } from 'react';
import Link from 'next/link';
import { globalNavItems } from '../../../lib/navConfig';
import { Bell, Settings, LogOut, X } from 'lucide-react';
import synergyLogo from '@/app/../../public/synergy-logo.png';

interface GlobalSidebarProps {
  activeFeatureId: string;
  isOpen: boolean;
  onClose: () => void;
}

const GlobalSidebar: FC<GlobalSidebarProps> = ({ activeFeatureId, isOpen, onClose }) => {
  
  // Filter out notifications and settings from main nav since they're in the bottom section
  const mainNavItems = globalNavItems.filter(item => 
    item.id !== 'notifications' && item.id !== 'settings'
  );

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
                <span className="text-sm font-medium text-white">YS</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">Yash Shende</p>
                <p className="text-xs text-secondary truncate">yash@synergy.ai</p>
              </div>
              <button className="p-1 text-secondary hover:text-white">
                <Settings size={16} />
              </button>
              <button className="p-1 text-secondary hover:text-white">
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