import { FC } from 'react';
import { BellRing, AlertTriangle } from 'lucide-react';
import { Alert, AlertPriority } from '../../../../types';

interface ScoreCardProps {
  isActive: boolean;
}

// --- THIS IS THE FIX ---
// We now include the required 'timestamp' property for each alert object
// and have separated it from the 'source' for consistency.
const mockLatestAlerts: Alert[] = [
  { id: 'a1', priority: 'Critical', title: 'CEO resignation detected at SolarTech', type: 'Reputational', source: 'MCA Filing', timestamp: '2h ago', description: 'Full description here...', aiInsight: 'Potential leadership instability.' },
  { id: 'a2', priority: 'High', title: 'Competitor filed lawsuit against AquaLogistics', type: 'Legal', source: 'News API', timestamp: '8h ago', description: 'Full description here...', aiInsight: 'May impact deal valuation.' },
  { id: 'a3', priority: 'Medium', title: 'Funding slowdown reported in FinTech sector', type: 'Market', source: 'Press Release', timestamp: '1d ago', description: 'Full description here...', aiInsight: 'Could affect future funding rounds.' },
];

const getPriorityIcon = (priority: AlertPriority) => {
    const props = { size: 14, className: 'flex-shrink-0 mt-0.5' };
    switch (priority) {
        case 'Critical': return <AlertTriangle {...props} color="#E53E3E" />;
        case 'High': return <AlertTriangle {...props} color="#DD6B20" />;
        case 'Medium': return <AlertTriangle {...props} color="#D69E2E" />;
        case 'Low': return <AlertTriangle {...props} color="#3182CE" />;
    }
}

const AlertsCard: FC<ScoreCardProps> = ({ isActive }) => {
  return (
    <div className={`p-4 rounded-xl border bg-surface/50 backdrop-blur-lg text-left transition-all duration-300 cursor-pointer overflow-hidden ${isActive ? 'border-primary ring-2 ring-primary/50' : 'border-border hover:border-secondary'}`}>
      <div className="flex items-center gap-2 mb-2">
        <BellRing className="text-amber-400" size={18}/>
        <h3 className="font-bold text-white">Alerts & Red Flags</h3>
      </div>
      <div className="space-y-2">
        {mockLatestAlerts.map(alert => (
           <div key={alert.id} className="flex items-start gap-2 text-xs">
             {getPriorityIcon(alert.priority)}
             <div>
                <p className="text-slate-300 truncate">{alert.title}</p>
                {/* We now display both source and timestamp correctly */}
                <p className="text-slate-500">{alert.source} • {alert.timestamp}</p>
             </div>
           </div>
        ))}
      </div>
    </div>
  );
};

export default AlertsCard;