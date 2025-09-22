import { FC } from 'react';
import { BarChart3 } from 'lucide-react';

interface ScenarioVisualizationPanelProps {
  scenario: any;
}

const ScenarioVisualizationPanel: FC<ScenarioVisualizationPanelProps> = ({ scenario }) => {
  // In a real app, this component would receive the base model data
  // and re-calculate the outputs based on the scenario prop.
  
  return (
    <div className="p-4 rounded-xl border border-border bg-surface/50 h-full">
      <h3 className="font-bold text-white mb-4">Scenario Impact Visualization</h3>
      <div className="flex items-center justify-center h-full bg-background/50 rounded-lg">
        <div className="text-center text-secondary">
          <BarChart3 size={48} className="mx-auto mb-2 opacity-50"/>
          <p className="font-semibold">[ECharts Comparison Charts]</p>
          <p className="text-xs">Showing Base Case vs. "{scenario.name}"</p>
        </div>
      </div>
    </div>
  );
};

export default ScenarioVisualizationPanel;