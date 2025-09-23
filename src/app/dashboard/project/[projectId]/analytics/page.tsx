'use client';

import { useState } from 'react';
import RiskScoreCard from '../../../../../components/features/analytics/risk/RiskScoreCard';
import { TargetCompanyRiskProfile } from '../../../../../types';

// Mock data for multiple target companies
const mockTargets: TargetCompanyRiskProfile[] = [
  {
    id: 'target-1',
    name: 'SolarTech Inc.',
    overallScore: 68,
    topRisks: ['Revenue dependency on one client.', 'Pending litigation from ex-employee.', 'High employee attrition rate in Q2.'],
    detailedBreakdown: [
      { category: 'Financial', score: 72, insights: ['70% revenue from top 2 customers.', 'Debt-to-Equity > 3x average.'] },
      { category: 'Legal', score: 55, insights: ['Pending litigation.', 'IP ownership unverified.'] },
      { category: 'Operational', score: 63, insights: ['High supplier dependency.', 'Key-person risk on CTO.'] },
      { category: 'Reputational', score: 80, insights: ['Negative press in Q2.', 'Poor Glassdoor reviews.'] },
      { category: 'Cultural', score: 45, insights: ['High attrition rate.', 'Management style mismatch.'] },
    ]
  },
  {
    id: 'target-2',
    name: 'AquaLogistics',
    overallScore: 35,
    topRisks: ['Low margin contracts.', 'High fuel cost sensitivity.', 'Pending union negotiations.'],
    detailedBreakdown: [
      { category: 'Financial', score: 45, insights: ['Margins below industry average.'] },
      { category: 'Legal', score: 25, insights: ['No active litigation.'] },
      { category: 'Operational', score: 50, insights: ['Aging fleet of vehicles.'] },
      { category: 'Reputational', score: 20, insights: ['Strong industry reputation.'] },
      { category: 'Cultural', score: 30, insights: ['Low employee turnover.'] },
    ]
  },
  {
    id: 'target-3',
    name: 'GeoFarms',
    overallScore: 52,
    topRisks: ['Weather dependency.', 'Regulatory uncertainty.', 'Supply chain disruptions.'],
    detailedBreakdown: [], // Example with no detailed data yet
  }
];

export default function AnalyticsRiskPage() {
  // This state tracks which card is currently expanded
  // --- AFTER ---
const [expandedCompanyId, setExpandedCompanyId] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {mockTargets.map(company => (
        <RiskScoreCard 
          key={company.id}
          company={company}
          isExpanded={expandedCompanyId === company.id}
         // --- AFTER ---
onClick={() => setExpandedCompanyId(expandedCompanyId === company.id ? null : company.id)}
        />
      ))}
    </div>
  );
}