import { FC, useState } from 'react';
import { CompanyMapProfile } from '../../../../types';
import HoverCard from './HoverCard';
import React from 'react'; // Import React for style prop

interface CompanyLogoNodeProps {
  company: CompanyMapProfile;
  onClick: () => void;
  style: React.CSSProperties;
}

const CompanyLogoNode: FC<CompanyLogoNodeProps> = ({ company, onClick, style }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // --- THE FIX: Larger, more impactful logo sizing ---
  // The size is now based on employee count for a third data dimension
  const size = Math.max(32, Math.min(64, 24 + Math.sqrt(company.employees) / 40));

  return (
    // We use the `style` prop to absolutely position this node on the canvas
    <div 
      style={style}
      onMouseEnter={() => setIsHovered(true)} 
      onMouseLeave={() => setIsHovered(false)} 
      className="relative z-10"
    >
      <button 
        onClick={onClick} 
        style={{ height: `${size}px`, width: `${size}px` }}
        className="rounded-full bg-white p-1.5 shadow-lg transition-all duration-300 ease-in-out hover:scale-110 hover:ring-2 hover:ring-primary z-10"
        title={company.name} // Adds a native tooltip for accessibility
      >
        <img src={company.logoUrl} alt={company.name} className="h-full w-full rounded-full object-contain" />
      </button>
      
      {/* The hover card appears on hover */}
      {isHovered && <HoverCard company={company} />}
    </div>
  );
};

export default CompanyLogoNode;