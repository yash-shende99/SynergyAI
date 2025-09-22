import { ShieldAlert } from 'lucide-react';
import DetailedRiskRadial from './DetailedRiskRadial';
import { RiskItem } from '../../../../types';

// Mock data for the detailed breakdown
const riskData: RiskItem[] = [
  { category: 'Financial', score: 72, insights: ['70% revenue from top 2 customers.', 'Debt-to-Equity > 3x industry average.'] },
  { category: 'Legal', score: 55, insights: ['Pending litigation from ex-employee.', 'IP ownership for core patent unverified.'] },
  { category: 'Operational', score: 63, insights: ['High dependency on a single supplier.', 'Key-person risk on CTO.'] },
  { category: 'Reputational', score: 80, insights: ['Negative press coverage in Q2.', 'Poor Glassdoor reviews.'] },
  { category: 'Cultural', score: 45, insights: ['High employee attrition rate.', 'Mismatch in management style.'] },
];

const RiskScoreExpandedView = () => {
  return (
    <div className="p-6 rounded-xl border border-border bg-surface/80 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
        <div className="flex items-center gap-3">
            <ShieldAlert className="text-red-500 h-6 w-6" />
            <h3 className="text-lg font-bold text-white">Detailed Risk Breakdown for Project Helios</h3>
        </div>
        <div className="flex items-center gap-2 text-sm">
            <span className="text-secondary">Target:</span>
            <button className="px-3 py-1 bg-primary/20 text-primary rounded-md">SolarTech Inc.</button>
            <button className="px-3 py-1 bg-surface text-secondary hover:bg-border rounded-md">AquaLogistics</button>
        </div>
      </div>

      {/* Grid for the 5 detailed radial charts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {riskData.map(risk => (
          <DetailedRiskRadial key={risk.category} risk={risk} />
        ))}
      </div>
    </div>
  );
};

export default RiskScoreExpandedView;