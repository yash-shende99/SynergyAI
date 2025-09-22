import { FC } from 'react';
import { Search } from 'lucide-react';
import { Alert, AlertPriority } from '../../../../types';

// Mock data for the full alerts list
const allAlerts: Alert[] = [
  { id: 'a1', priority: 'Critical', title: 'CEO resignation detected at SolarTech', type: 'Reputational', source: 'MCA Filing', timestamp: '2h ago', description: 'The Ministry of Corporate Affairs (MCA) has received a DIR-11 filing indicating the resignation of the current CEO of SolarTech Inc., effective immediately.', aiInsight: 'Potential leadership instability poses a critical risk to the ongoing acquisition talks. Recommend engaging with the board to understand the succession plan.' },
  { id: 'a2', priority: 'High', title: 'Competitor filed lawsuit against AquaLogistics', type: 'Legal', source: 'News API', timestamp: '8h ago', description: 'A major competitor has filed a patent infringement lawsuit against AquaLogistics in the Delhi High Court, seeking damages and an injunction.', aiInsight: 'This poses a high legal and financial risk. Recommend immediate review by the legal team to assess the merit of the lawsuit.' },
  { id: 'a3', priority: 'Medium', title: 'Funding slowdown reported in FinTech sector', type: 'Market', source: 'Press Release', timestamp: '1d ago', description: '...', aiInsight: '...' },
  { id: 'a4', priority: 'Low', title: 'Q2 Financials show minor revenue miss', type: 'Financial', source: 'VDR Upload', timestamp: '2d ago', description: '...', aiInsight: '...' },
]

const PriorityBadge: React.FC<{priority: AlertPriority}> = ({priority}) => {
    const colors = {
        Critical: 'bg-red-500/30 text-red-300 border-red-500/50',
        High: 'bg-orange-500/30 text-orange-300 border-orange-500/50',
        Medium: 'bg-amber-500/30 text-amber-300 border-amber-500/50',
        Low: 'bg-blue-500/30 text-blue-300 border-blue-500/50',
    }
    return <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${colors[priority]}`}>{priority}</span>
}

interface AlertsTableProps {
  onAlertSelect: (alert: Alert) => void;
}

const AlertsTable: FC<AlertsTableProps> = ({ onAlertSelect }) => {
    return (
        <div className="p-4 rounded-xl border border-border bg-surface/50 h-full">
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" size={18} />
                <input type="text" placeholder="Search alerts..." className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm"/>
            </div>
            <table className="w-full text-left text-sm">
                <thead className="border-b border-border text-xs text-secondary">
                    <tr>
                        <th className="p-2">Alert</th>
                        <th className="p-2">Type</th>
                        <th className="p-2">Priority</th>
                        <th className="p-2">Source</th>
                        <th className="p-2">Time</th>
                    </tr>
                </thead>
                <tbody>
                    {allAlerts.map(alert => (
                        <tr key={alert.id} onClick={() => onAlertSelect(alert)} className="border-b border-border/50 hover:bg-surface/50 cursor-pointer">
                            <td className="p-2 font-medium text-white">{alert.title}</td>
                            <td className="p-2 text-slate-300">{alert.type}</td>
                            <td className="p-2"><PriorityBadge priority={alert.priority}/></td>
                            <td className="p-2 text-slate-300">{alert.source}</td>
                            <td className="p-2 text-slate-400">{alert.timestamp}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AlertsTable;