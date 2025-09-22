import SynergyGaugeWidget from './SynergyGaugeWidget';
import SynergyBreakdownCard from './SynergyBreakdownCard';
import DetailedInsightsPanel from './DetailedInsightsPanel';
import ScenarioSimulator from './ScenarioSimulator';
import { SynergyItem } from '../../../../types';

// Mock Data
const costSynergies: SynergyItem[] = [
  { name: 'SG&A Reduction', value: 10, confidence: 'High' },
  { name: 'Supply Chain', value: 8, confidence: 'High' },
  { name: 'Infrastructure', value: 7, confidence: 'Medium' },
];

const revenueSynergies: SynergyItem[] = [
  { name: 'Cross-selling', value: 40, confidence: 'Medium' },
  { name: 'Market Expansion', value: 15, confidence: 'Low' },
];

const SynergyScoreSection = () => {
  return (
    <div className="space-y-6">
      {/* 1. Hero Section */}
      <SynergyGaugeWidget />

      {/* 2. Breakdown Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SynergyBreakdownCard title="Cost Synergies" iconType="cost" data={costSynergies} />
        <SynergyBreakdownCard title="Revenue Synergies" iconType="revenue" data={revenueSynergies} />
      </div>

      {/* 3. Detailed Insights Panel */}
      <DetailedInsightsPanel />
      
      {/* 4. Scenario Simulator */}
      <ScenarioSimulator />
    </div>
  );
};

export default SynergyScoreSection;