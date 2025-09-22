import { AlertTriangle, FileText, BarChart, HardHat } from 'lucide-react';

const riskAlerts = [
  { id: 1, type: 'Contract', text: 'Termination for convenience clause flagged in Acme Corp supply agreement.', deal: 'Project Helios', icon: FileText, color: 'text-amber-400' },
  { id: 2, type: 'Financial', text: 'Inconsistent revenue recognition pattern detected in FY23 filings.', deal: 'Project Neptune', icon: BarChart, color: 'text-red-400' },
  { id: 3, type: 'Market', text: 'Key competitor IPO filing is likely within the next 3 months.', deal: 'Project Helios', icon: AlertTriangle, color: 'text-amber-400' },
  { id: 4, type: 'Operational', text: 'High dependency on a single supplier for critical components identified.', deal: 'Project Atlas', icon: HardHat, color: 'text-red-400' },
];

const RiskAlertsPanel = () => {
  return (
    <div className="p-6 bg-surface/80 border border-border rounded-xl backdrop-blur-sm h-full">
      <div className="flex items-center gap-3 mb-4">
        <AlertTriangle className="text-red-500 h-6 w-6" />
        <h3 className="text-lg font-bold text-white">Real-Time Risk Alerts</h3>
      </div>
      <div className="space-y-4">
        {riskAlerts.map(alert => (
          <div key={alert.id} className="flex items-start gap-4 p-4 rounded-lg bg-background/50 hover:bg-surface/80 cursor-pointer transition-colors">
            <alert.icon className={`h-5 w-5 mt-1 flex-shrink-0 ${alert.color}`} />
            <div>
              <p className="font-semibold text-white">{alert.text}</p>
              <span className="text-xs text-secondary">{alert.type} Risk • {alert.deal}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RiskAlertsPanel;