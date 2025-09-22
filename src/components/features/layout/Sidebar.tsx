'use client';
import { FC } from 'react';
import {
  LayoutDashboard,
  ShieldCheck,
  MessageCircle,
  BarChart,
  Calculator,
  FileText,
  Bell,
  Settings,
  LogOut,
  Search,
  X
} from 'lucide-react';
import Link from 'next/link';
import { FeatureKey } from '../../../types'; 
import synergyLogo from '@/app/../../public/synergy-logo.png';

interface SidebarProps {
  activeFeature: FeatureKey;
  setActiveFeature: (feature: FeatureKey) => void;
  isOpen: boolean;
  onClose: () => void;
}


const navItems = [
  { id: 'dashboard', name: 'Mission Control', icon: LayoutDashboard, href: '/dashboard' },
  { id: 'sourcing', name: 'Deal Sourcing', icon: Search, href: '/dashboard/sourcing' },
  { id: 'vdr', name: 'VDR', icon: ShieldCheck, href: '/dashboard/vdr' },
  { id: 'chat', name: 'AI Co-Pilot', icon: MessageCircle, href: '/dashboard/chat' },
  { id: 'analytics', name: 'Analytics & Risk', icon: BarChart, href: '/dashboard/analytics' },
  { id: 'valuation', name: 'Valuation & Models', icon: Calculator, href: '/dashboard/valuation' },
  { id: 'reports', name: 'Reports / Memos', icon: FileText, href: '/dashboard/reports' },
];

const Sidebar: FC<SidebarProps> = ({ activeFeature, setActiveFeature, isOpen, onClose }) => {
  return (
    <>
      {/* Overlay for mobile - appears when menu is open */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/60 z-30 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      />
      <aside className={`fixed lg:relative top-0 left-0 h-full w-64 flex-shrink-0 flex flex-col backdrop-blur-xl rounded-3xl z-40 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0`}>
        <div className="p-4 flex items-center justify-between">
          <div className="bg-secondarySurface rounded-full px-4 py-2 border border-border flex items-center space-x-2">
            <img src={synergyLogo.src} alt="SynergyAI" className="h-8 w-8 bg-secondarySurface" />
            <h1 className="text-xl font-bold text-white tracking-tight">SynergyAI</h1>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-1 text-secondary hover:text-white"
          >
            <X size={24} />
          </button>
        </div>
          
        <nav className="flex-1 p-2 space-y-1 bg-secondarySurface rounded-t-3xl overflow-y-auto">
          {navItems.map((item) => (
            <Link href={item.href} key={item.id} passHref>
              <button
                onClick={() => setActiveFeature(item.id as FeatureKey)} // Ensure type safety
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all duration-200 text-sm font-medium ${activeFeature === item.id
                    ? 'border-primary border-l-4 text-white '
                    : 'text-secondary hover:bg-secondarySurface hover:text-white'
                  }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </button>
            </Link>
          ))}
        </nav>
        <div className="p-2 border-t bg-secondarySurface rounded-b-3xl border-border">
          <Link href="/dashboard/notifications" passHref>
            <button
              onClick={() => setActiveFeature('notifications')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left text-sm font-medium transition-colors ${activeFeature === 'notifications'
                  ? 'bg-primary/20 text-primary'
                  : 'text-secondary hover:bg-secondarySurface'
                }`}
            >
              <Bell className="h-5 w-5" />
              <span>Notifications</span>
            </button>
          </Link>

          <Link href="/dashboard/settings" passHref>
            {/* --- THIS IS THE FIX --- */}
            <button
              onClick={() => setActiveFeature('settings')} // Use 'settings' as the key
              className={`w-full flex items-center gap-3 px-3 py-2 mt-1 rounded-md text-left text-sm font-medium transition-colors ${activeFeature === 'settings'
                  ? 'bg-primary/20 text-primary'
                  : 'text-secondary hover:bg-secondarySurface'
                }`}
            >
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </button>
          </Link>
          <div className="p-2 mt-2 border-t border-border/50">
            <div className="flex items-center gap-3">
              <img src="https://placehold.co/40x40/E2E8F0/111827?text=YS" alt="User Avatar" className="h-10 w-10 rounded-full" />
              <div>
                <p className="text-sm font-semibold text-white">Yash Shende</p>
                <p className="text-xs text-secondary">yash@synergy.ai</p>
              </div>
              <button className="ml-auto text-secondary hover:text-white"><LogOut size={16} /></button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;