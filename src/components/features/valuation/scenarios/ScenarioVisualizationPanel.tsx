// components/features/valuation/scenarios/ScenarioVisualizationPanel.tsx
import { FC } from 'react';
import { Scenario } from '../../../../types';
import ScenarioChart from './ScenarioChart';

interface ScenarioVisualizationPanelProps {
  scenario: Scenario;
}

const ScenarioVisualizationPanel: FC<ScenarioVisualizationPanelProps> = ({ scenario }) => {
  // Calculate some key metrics for display
  const calculateImpact = () => {
    const baseRevenue = 1000; // Base revenue in Cr
    const baseCogs = 600;    // Base COGS in Cr
    
    const scenarioRevenue = baseRevenue * (1 + scenario.variables.revenueChange / 100);
    const scenarioCogs = baseCogs * (1 + scenario.variables.cogsChange / 100);
    const scenarioGrossProfit = scenarioRevenue - scenarioCogs;
    const baseGrossProfit = baseRevenue - baseCogs;
    
    const revenueImpact = scenarioRevenue - baseRevenue;
    const grossProfitImpact = scenarioGrossProfit - baseGrossProfit;
    const grossMargin = (scenarioGrossProfit / scenarioRevenue) * 100;
    const baseGrossMargin = (baseGrossProfit / baseRevenue) * 100;
    
    return {
      revenueImpact,
      grossProfitImpact,
      grossMargin,
      baseGrossMargin,
      marginChange: grossMargin - baseGrossMargin
    };
  };

  const impacts = calculateImpact();

  return (
    <div className="p-4 rounded-xl border border-border bg-surface/50 h-full flex flex-col">
      <h3 className="font-bold text-white mb-4">Scenario Impact Analysis</h3>
      
      {/* Key Metrics Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-3 rounded-lg bg-background/50 border border-border">
          <p className="text-xs text-secondary">Revenue Impact</p>
          <p className={`text-lg font-bold ${impacts.revenueImpact >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {impacts.revenueImpact >= 0 ? '+' : ''}₹{impacts.revenueImpact.toFixed(1)} Cr
          </p>
        </div>
        <div className="p-3 rounded-lg bg-background/50 border border-border">
          <p className="text-xs text-secondary">Profit Impact</p>
          <p className={`text-lg font-bold ${impacts.grossProfitImpact >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {impacts.grossProfitImpact >= 0 ? '+' : ''}₹{impacts.grossProfitImpact.toFixed(1)} Cr
          </p>
        </div>
        <div className="p-3 rounded-lg bg-background/50 border border-border">
          <p className="text-xs text-secondary">Gross Margin</p>
          <p className="text-lg font-bold text-white">
            {impacts.grossMargin.toFixed(1)}%
          </p>
        </div>
        <div className="p-3 rounded-lg bg-background/50 border border-border">
          <p className="text-xs text-secondary">Margin Change</p>
          <p className={`text-lg font-bold ${impacts.marginChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {impacts.marginChange >= 0 ? '+' : ''}{impacts.marginChange.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Chart Container */}
      <div className="flex-1 min-h-[400px]">
        <ScenarioChart scenario={scenario} />
      </div>

      {/* Scenario Summary */}
      <div className="mt-4 p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg">
        <h4 className="font-semibold text-blue-300 mb-2">Scenario Summary</h4>
        <div className="text-sm text-white/80 space-y-1">
          <p>• Revenue: {scenario.variables.revenueChange >= 0 ? '+' : ''}{scenario.variables.revenueChange}%</p>
          <p>• COGS: {scenario.variables.cogsChange >= 0 ? '+' : ''}{scenario.variables.cogsChange}%</p>
          <p>• Tax Rate: {scenario.variables.taxRate}%</p>
          <p>• Discount Rate: {scenario.variables.discountRate}%</p>
        </div>
      </div>
    </div>
  );
};

export default ScenarioVisualizationPanel;