'use client';
import { FC } from 'react';
import { Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SubFeature, NavItem } from '../../../types';
import { findActiveFeature } from '../../../lib/navConfig';

interface FeatureHeaderProps {
  title: string;
  subFeatures: SubFeature[];
  onMenuClick: () => void;
  baseHref: string;
}

const FeatureHeader: FC<FeatureHeaderProps> = ({ title, subFeatures, onMenuClick, baseHref }) => {
  const pathname = usePathname();
  
  const subFeatureNavItems: NavItem[] = subFeatures.map(sf => ({ ...sf, id: sf.name.toLowerCase(), icon: Menu }));
  const activeSubFeature = findActiveFeature(pathname, subFeatureNavItems, baseHref);

  return (
    <header className="flex-shrink-0 flex flex-col p-2">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 relative">
        {/* Left Side: Hamburger Menu (Mobile) and Title */}
        <div className="bg-secondarySurface rounded-full px-6 py-3 border border-border flex items-center space-x-2">
          <button 
            onClick={onMenuClick} 
            className="lg:hidden p-1 text-secondary hover:text-white"
            aria-label="Open sidebar"
          >
            <Menu size={24} />
          </button>
          
          <h2 className="text-xl font-bold text-white truncate">{title}</h2>
        </div>

        {/* Center: Sub-Feature Navigation (visible on medium screens and up) */}
        <nav className="hidden lg:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-4 bg-secondarySurface rounded-full px-6 py-4 border border-border space-x-2">
          {subFeatures.map((feature) => (
            <Link href={feature.href} key={feature.name}>
              <span className={`py-2 px-1 text-sm font-medium cursor-pointer transition-colors whitespace-nowrap border-b-2 
                ${activeSubFeature?.href === feature.href
                  ? 'text-primary border-primary'
                  : 'text-secondary hover:text-white border-transparent'
              }`}>
                {feature.name}
              </span>
            </Link>
          ))}
        </nav>

        {/* Right Side: A placeholder for action buttons */}
        <div className="w-24 hidden sm:block">
          {/* Action buttons will go here */}
        </div>
      </div>

      {/* Mobile Navigation (Scrollable Tab Bar) */}
      <nav className="lg:hidden flex items-center gap-4 px-4 sm:px-6 overflow-x-auto scrollbar-hide border-t border-border/50">
        {subFeatures.map((feature) => (
          <Link href={feature.href} key={feature.name}>
            <span className={`py-2 text-sm font-medium cursor-pointer transition-colors whitespace-nowrap border-b-2 
              ${activeSubFeature?.href === feature.href
                ? 'text-primary border-primary'
                : 'text-secondary hover:text-white border-transparent'
            }`}>
              {feature.name}
            </span>
          </Link>
        ))}
      </nav>
    </header>
  );
};

export default FeatureHeader;