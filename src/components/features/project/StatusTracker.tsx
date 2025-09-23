import { FC } from 'react';
import { DealStatus } from '../../../types';
import { CheckCircle } from 'lucide-react';

const stages: DealStatus[] = ['Sourcing', 'Diligence', 'Negotiation', 'Completed'];

const StatusTracker: FC<{ currentStatus: DealStatus }> = ({ currentStatus }) => {
  const currentIndex = stages.indexOf(currentStatus);

  return (
    <div className="p-4 rounded-xl border border-border bg-surface/50">
      <div className="flex items-center justify-between">
        {stages.map((stage, index) => {
          const isCompleted = index < currentIndex;
          const isActive = index === currentIndex;
          return (
            <div key={stage} className="flex-1 flex items-center gap-2">
              <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  isActive ? 'bg-primary text-white ring-4 ring-primary/20' : isCompleted ? 'bg-green-500 text-white' : 'bg-border text-secondary'
              }`}>
                {isCompleted ? <CheckCircle size={14} /> : index + 1}
              </div>
              <span className={`font-medium ${isActive ? 'text-white' : 'text-secondary'}`}>{stage}</span>
              {index < stages.length - 1 && (
                <div className={`flex-1 h-1 rounded-full mx-4 transition-colors ${isCompleted ? 'bg-primary' : 'bg-border'}`}></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatusTracker;
