// components/features/valuation/scenarios/DynamicFeedbackPanel.tsx
import { FC } from 'react';
import { Scenario } from '../../../../types';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

interface DynamicFeedbackPanelProps {
  variables: Scenario['variables'];
}

const DynamicFeedbackPanel: FC<DynamicFeedbackPanelProps> = ({ variables }) => {
  // Enhanced impact calculation
  const calculateImpact = () => {
    const baseRevenue = 1000;
    const baseCogs = 600;
    
    const scenarioRevenue = baseRevenue * (1 + variables.revenueChange / 100);
    const scenarioCogs = baseCogs * (1 + variables.cogsChange / 100);
    const scenarioGrossProfit = scenarioRevenue - scenarioCogs;
    const baseGrossProfit = baseRevenue - baseCogs;
    
    const profitImpact = scenarioGrossProfit - baseGrossProfit;
    const marginImpact = (scenarioGrossProfit / scenarioRevenue) * 100 - (baseGrossProfit / baseRevenue) * 100;
    
    return { profitImpact, marginImpact };
  };

  const { profitImpact, marginImpact } = calculateImpact();
  const isPositive = profitImpact >= 0;

  // Generate insights based on the scenario
  const getInsights = () => {
    const insights = [];
    
    if (variables.revenueChange > 20) {
      insights.push("Aggressive revenue growth assumption");
    } else if (variables.revenueChange < 0) {
      insights.push("Revenue decline scenario");
    }
    
    if (variables.cogsChange < -5) {
      insights.push("Significant cost optimization");
    } else if (variables.cogsChange > 5) {
      insights.push("Cost pressure scenario");
    }
    
    if (profitImpact > 50) {
      insights.push("Highly positive profit impact");
    } else if (profitImpact < -50) {
      insights.push("Significant profit erosion");
    }
    
    return insights.length > 0 ? insights : ["Moderate impact on financials"];
  };

  const insights = getInsights();

  return (
    <div className="mt-4 p-4 rounded-lg bg-background/50 border border-border/50">
      <h4 className="text-sm font-semibold text-secondary mb-3">Scenario Impact Analysis</h4>
      
      {/* Key Metrics */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">Profit Impact:</span>
          <div className="flex items-center gap-1">
            {isPositive ? <TrendingUp size={14} className="text-green-400"/> : <TrendingDown size={14} className="text-red-400"/>}
            <span className={`text-sm font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {isPositive ? '+' : ''}₹{profitImpact.toFixed(1)}M
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">Margin Change:</span>
          <span className={`text-sm font-semibold ${marginImpact >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {marginImpact >= 0 ? '+' : ''}{marginImpact.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Insights */}
      <div className="border-t border-border/50 pt-3">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle size={14} className="text-blue-400" />
          <span className="text-xs font-semibold text-blue-400">Key Insights</span>
        </div>
        <ul className="text-xs text-slate-300 space-y-1">
          {insights.map((insight, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">•</span>
              {insight}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DynamicFeedbackPanel;