import { FC } from 'react';

// This is a reusable SVG logo component for SynergyAI.
// It can be resized using the `className` prop (e.g., "h-16 w-16").
const Logo: FC<{ className?: string }> = ({ className }) => (
  <svg 
    className={className}
    viewBox="0 0 40 40" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    aria-label="SynergyAI Logo"
  >
    <path d="M20 0C8.95431 0 0 8.95431 0 20C0 31.0457 8.95431 40 20 40C31.0457 40 40 31.0457 40 20C40 8.95431 31.0457 0 20 0Z" fill="url(#paint0_linear_logo)"/>
    <path d="M26.5 13.5C26.5 10.4624 23.9101 8 20.75 8C17.5899 8 15 10.4624 15 13.5V14.5H20.75M13.5 26.5C13.5 29.5376 16.0899 32 19.25 32C22.4101 32 25 29.5376 25 26.5V25.5H19.25" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <defs>
      <linearGradient id="paint0_linear_logo" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
        <stop stopColor="#3B82F6"/>
        <stop offset="1" stopColor="#2563EB"/>
      </linearGradient>
    </defs>
  </svg>
);

export default Logo;

