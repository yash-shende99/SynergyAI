import { FC } from 'react';
import { CompanyMapProfile } from '../../../../types';
import CompanyLogoNode from './CompanyLogoNode';

interface QuadrantMapCanvasProps {
  companies: CompanyMapProfile[];
  onCompanyClick: (company: CompanyMapProfile) => void;
}

// --- THIS IS THE DEFINITIVE FIX ---
// This new, robust normalization function now includes a "padding" parameter.
const normalize = (value: number, min: number, max: number, padding: number = 10) => {
  if (max === min) return 50; // Avoid division by zero if all values are the same
  
  // 1. Calculate the scaled value from 0 to 1
  const scaledValue = (value - min) / (max - min);
  
  // 2. Map this to our padded range. For example, with padding=10, this maps to a range of 10% to 90%.
  // This ensures no node is ever placed exactly on the 0% or 100% edge.
  return padding + (scaledValue * (100 - 2 * padding));
};
// --- END OF FIX ---

const QuadrantMapCanvas: FC<QuadrantMapCanvasProps> = ({ companies, onCompanyClick }) => {
  // Find the min/max values from the data to create the scales for our axes
  const revenues = companies.map(c => c.revenue);
  const growths = companies.map(c => c.growth);
  const minRevenue = Math.min(...revenues, 0);
  const maxRevenue = Math.max(...revenues, 1);
  const minGrowth = Math.min(...growths, 0);
  const maxGrowth = Math.max(...growths, 1);

  return (
    <div className="flex-1 p-4 rounded-xl border border-border bg-surface/50 h-full relative overflow-hidden">
      {/* The Axis Structure */}
      <div className="absolute top-1/2 left-0 w-full h-px bg-border/50"></div>
      <div className="absolute left-1/2 top-0 h-full w-px bg-border/50"></div>

      {/* Axis Labels */}
      <span className="absolute top-2 left-2 text-xs text-secondary">High Growth</span>
      <span className="absolute bottom-2 left-2 text-xs text-secondary">Low Growth</span>
      <span className="absolute bottom-2 right-2 text-xs text-secondary">High Revenue</span>
      
      {/* The "Galaxy" of Company Logos */}
      <div className="w-full h-full relative">
        {companies.map(company => {
          // Calculate the position for each logo using our new, safe function
          const xPos = normalize(company.revenue, minRevenue, maxRevenue);
          const yPos = 100 - normalize(company.growth, minGrowth, maxGrowth); // Invert Y-axis for correct quadrant placement

          return (
            <CompanyLogoNode 
              key={company.cin} 
              company={company} 
              onClick={() => onCompanyClick(company)}
              style={{
                position: 'absolute',
                left: `${xPos}%`,
                top: `${yPos}%`,
                transform: 'translate(-50%, -50%)',
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default QuadrantMapCanvas;