import SuggestedQuestionCard from './SuggestedQuestionCard';
import { Lightbulb } from 'lucide-react';

// Mock data categorized by deal stage
const suggestions = {
  sourcing: [
    "List top acquisition targets in fintech with >20% YoY growth.",
    "Show me logistics companies in Tier-2 cities with positive cash flow.",
    "Who are the main competitors to Zomato in the quick-commerce space?",
  ],
  diligence: [
    "Summarize all contracts with termination clauses for Project Helios.",
    "What are the key risks mentioned in the latest SEBI filings for Infosys?",
    "Analyze the employee retention rates from the HR documents.",
  ],
  valuation: [
    "What are the last 3 years' revenue growth rates for Freshworks?",
    "Run a DCF valuation for Project Neptune based on the provided projections.",
    "Find precedent transactions for SaaS companies acquired in the last 12 months.",
  ],
};

const SuggestedSection = () => {
  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl border border-border bg-surface/50 text-center">
        <Lightbulb className="mx-auto h-8 w-8 text-primary mb-2"/>
        <h2 className="text-xl font-bold text-white">Suggested Questions</h2>
        <p className="mt-1 text-secondary text-sm">
          Based on your project data, here are some things you can ask the AI.
        </p>
      </div>

      {/* Sourcing Stage Suggestions */}
      <div>
        <h3 className="font-semibold text-white mb-2">For Deal Sourcing</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suggestions.sourcing.map((q, i) => <SuggestedQuestionCard key={i} question={q} />)}
        </div>
      </div>
      
      {/* Diligence Stage Suggestions */}
      <div>
        <h3 className="font-semibold text-white mb-2">For Due Diligence</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suggestions.diligence.map((q, i) => <SuggestedQuestionCard key={i} question={q} />)}
        </div>
      </div>
      
       {/* Valuation Stage Suggestions */}
      <div>
        <h3 className="font-semibold text-white mb-2">For Valuation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suggestions.valuation.map((q, i) => <SuggestedQuestionCard key={i} question={q} />)}
        </div>
      </div>
    </div>
  );
};

export default SuggestedSection;