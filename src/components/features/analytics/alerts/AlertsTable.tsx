import { FC } from 'react';
import { Alert, AlertPriority } from '../../../../types';

// --- THIS IS THE DEFINITIVE FIX for the 'void' error ---
// The component is now a proper FC that returns JSX.
const PriorityBadge: FC<{priority: AlertPriority}> = ({priority}) => {
    const colors = {
        Critical: 'bg-red-500/30 text-red-300 border-red-500/50',
        High: 'bg-orange-500/30 text-orange-300 border-orange-500/50',
        Medium: 'bg-amber-500/30 text-amber-300 border-amber-500/50',
        Low: 'bg-blue-500/30 text-blue-300 border-blue-500/50',
    };
    return <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${colors[priority]}`}>{priority}</span>;
};

interface AlertsTableProps {
  alerts: Alert[];
  onAlertSelect: (alert: Alert) => void;
}

const AlertsTable: FC<AlertsTableProps> = ({ alerts, onAlertSelect }) => (
    <div className="p-4 rounded-xl border border-border bg-surface/50 h-full">
      <h3 className="font-bold text-white mb-4">Alerts Feed</h3>
      <table className="w-full text-left text-sm">
        {/* ... table header ... */}
        <tbody>
          {alerts.map(alert => (
            <tr key={alert.id} onClick={() => onAlertSelect(alert)} className="border-b border-border/50 hover:bg-surface/50 cursor-pointer">
              <td className="p-2 font-medium text-white">{alert.title}</td>
              <td className="p-2"><PriorityBadge priority={alert.priority}/></td>
              <td className="p-2 text-slate-400">{new Date(alert.timestamp).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
);
export default AlertsTable;