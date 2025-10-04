// components/features/project/FinancialMetricsPanel.tsx
import { FC } from 'react';
import { DollarSign, Users, TrendingUp } from 'lucide-react';

interface FinancialMetricsPanelProps {
  revenue: string;
  ebitdaMargin: string;
  employees: string;
  financialHealth: string;
}

const FinancialMetricsPanel: FC<FinancialMetricsPanelProps> = ({
  revenue,
  ebitdaMargin,
  employees,
  financialHealth
}) => {
  const getHealthColor = (health: string) => {
    switch (health) {
      case 'Strong': return 'text-green-400';
      case 'Moderate': return 'text-amber-400';
      case 'Weak': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="p-6 rounded-xl border border-border bg-surface/50 h-full">
      <div className="flex items-center gap-3 mb-4">
        <DollarSign className="h-6 w-6 text-primary"/>
        <h3 className="text-lg font-bold text-white">Financial Metrics</h3>
      </div>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-secondary">Revenue</span>
          <span className="text-white font-semibold">{revenue}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-secondary">EBITDA Margin</span>
          <span className="text-white font-semibold">{ebitdaMargin}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-secondary">Employees</span>
          <span className="text-white font-semibold">{employees}</span>
        </div>
        
        <div className="flex justify-between items-center pt-3 border-t border-border">
          <span className="text-sm text-secondary">Financial Health</span>
          <span className={`font-semibold ${getHealthColor(financialHealth)}`}>
            {financialHealth}
          </span>
        </div>
      </div>
    </div>
  );
};

export default FinancialMetricsPanel;