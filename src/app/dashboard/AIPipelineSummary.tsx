import { Deal } from '../../types';
import DealInsightCard from './DealInsightCard';

// Mock data that matches your plan's description
const mockDeals: Deal[] = [
  {
    id: 'deal-01',
    name: 'Project Helios - SolarTech Inc.',
    status: 'Diligence',
    aiSummary: 'Financials are strong, but legal risk is moderate due to pending IP contract reviews. High synergy potential.',
    keyRisks: [
      { id: 'risk-1', text: 'Unverified IP ownership for core patent.' },
      { id: 'risk-2', text: 'High customer concentration with Client X.' },
    ],
    nextActions: [
      { id: 'action-1', text: 'Legal team to review HR contracts by Sep 12.' },
      { id: 'action-2', text: 'Schedule call with SolarTech CTO.' },
    ],
  },
  {
    id: 'deal-02',
    name: 'Project Neptune - AquaLogistics',
    status: 'Negotiation',
    aiSummary: 'Valuation models are aligned. Final terms are under discussion. Low operational risk identified.',
    keyRisks: [
      { id: 'risk-3', text: 'Regulatory approval required in EU.' },
    ],
    nextActions: [
      { id: 'action-3', text: 'Finalize terms sheet with legal counsel.' },
    ],
  },
    {
    id: 'deal-03',
    name: 'Project Terra - GeoFarms',
    status: 'Sourcing',
    aiSummary: 'Early-stage target identified through predictive sourcing. Initial financials look promising. Fit score: 8.2/10.',
    keyRisks: [],
    nextActions: [
      { id: 'action-4', text: 'Initiate outreach to GeoFarms board.' },
    ],
  },
];

const AIPipelineSummary = () => {
  return (
    <div className="space-y-6">
      {/* AI Generated High-Level Summary */}
      <div className="p-6 bg-surface/80 border border-border rounded-xl backdrop-blur-sm">
        <h3 className="text-lg font-bold text-white">AI-Generated Pipeline Summary</h3>
        <p className="mt-2 text-secondary">
          Currently evaluating <span className="font-bold text-white">12 deals</span>. 
          <span className="text-green-400"> 3 in early-stage sourcing</span>, 
          <span className="text-amber-400"> 6 in diligence</span>, and 
          <span className="text-blue-400"> 3 in negotiation</span>.
        </p>
      </div>

      {/* Grid of Deal Insight Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {mockDeals.map((deal) => (
          <DealInsightCard key={deal.id} deal={deal} />
        ))}
      </div>
    </div>
  );
};

export default AIPipelineSummary;