import { FC } from 'react';
import { Deal, DealStatus } from '../../types';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface DealInsightCardProps {
  deal: Deal;
}

const getStatusColor = (status: DealStatus) => {
  switch (status) {
    case 'Sourcing': return 'bg-green-500/30 text-green-300 border-green-500/50';
    case 'Diligence': return 'bg-amber-500/30 text-amber-300 border-amber-500/50';
    case 'Negotiation': return 'bg-blue-500/30 text-blue-300 border-blue-500/50';
    case 'Completed': return 'bg-gray-500/30 text-gray-300 border-gray-500/50';
  }
};

const DealInsightCard: FC<DealInsightCardProps> = ({ deal }) => {
  return (
    <div className="group rounded-xl border border-border bg-surface/50 p-6 backdrop-blur-lg transition-all duration-300 hover:border-primary/50 hover:bg-surface/80 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-bold text-slate-100 pr-4">{deal.name}</h3>
        <span className={`px-3 py-1 text-xs font-semibold whitespace-nowrap rounded-full border ${getStatusColor(deal.status)}`}>
          {deal.status}
        </span>
      </div>

      {/* AI Summary */}
      <div>
        <h4 className="text-sm font-semibold text-secondary mb-1">AI Summary</h4>
        <p className="text-sm text-slate-300">{deal.aiSummary}</p>
      </div>
      
      {/* Key Risks */}
      {deal.keyRisks.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-secondary mb-2">Key Risks</h4>
          <ul className="space-y-1">
            {deal.keyRisks.map(risk => (
              <li key={risk.id} className="flex items-start gap-2 text-sm text-amber-300 cursor-pointer hover:text-amber-200">
                <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{risk.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggested Next Actions */}
      {deal.nextActions.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-secondary mb-2">Suggested Next Actions</h4>
          <ul className="space-y-1">
            {deal.nextActions.map(action => (
              <li key={action.id} className="flex items-start gap-2 text-sm text-slate-400 cursor-pointer hover:text-white">
                <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                <span>{action.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DealInsightCard;