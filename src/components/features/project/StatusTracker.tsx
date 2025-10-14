// components/features/project/StatusTracker.tsx
import { FC } from 'react';
import { DealStatus } from '../../../types';
import { CheckCircle, Clock, AlertCircle, Target, FileText, Users, Handshake } from 'lucide-react';

// Define all possible deal stages in order
const stages: DealStatus[] = ['Sourcing', 'Diligence', 'Negotiation', 'Completed'];

interface StatusTrackerProps {
  currentStatus: DealStatus;
  onStatusChange?: (newStatus: DealStatus) => void;
}

const StatusTracker: FC<StatusTrackerProps> = ({ currentStatus }) => {
  const currentIndex = stages.indexOf(currentStatus);

  const getStageIcon = (stage: DealStatus, isActive: boolean, isCompleted: boolean) => {
    if (isCompleted) return <CheckCircle size={16} className="text-white" />;
    
    switch (stage) {
      case 'Sourcing':
        return <Target size={14} className={isActive ? "text-white" : "text-current"} />;
      case 'Diligence':
        return <FileText size={14} className={isActive ? "text-white" : "text-current"} />;
      case 'Negotiation':
        return <Handshake size={14} className={isActive ? "text-white" : "text-current"} />;
      case 'Completed':
        return <CheckCircle size={14} className={isActive ? "text-white" : "text-current"} />;
      default:
        return <Clock size={14} className={isActive ? "text-white" : "text-current"} />;
    }
  };

  const getStageDescription = (stage: DealStatus) => {
    switch (stage) {
      case 'Sourcing':
        return "Identifying and evaluating potential acquisition targets";
      case 'Diligence':
        return "Comprehensive analysis of financial, legal, and operational aspects";
      case 'Negotiation':
        return "Finalizing deal terms and structure with stakeholders";
      case 'Completed':
        return "Deal finalized and integration process initiated";
      default:
        return "Deal stage in progress";
    }
  };

  return (
    <div className="p-6 rounded-xl border border-border bg-surface/50">
      <div className="flex items-center justify-between">
        {stages.map((stage, index) => {
          const isCompleted = index < currentIndex;
          const isActive = index === currentIndex;
          const isUpcoming = index > currentIndex;

          return (
            <div key={stage} className="flex-1 flex items-center gap-2">
              {/* Stage Circle */}
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center transition-all ${
                  isActive 
                    ? 'bg-synergy-ai-primary text-white ring-4 ring-synergy-ai-primary/20 shadow-lg' 
                    : isCompleted 
                    ? 'bg-synergy-ai-purple text-white shadow-md' 
                    : 'bg-secondary text-slate-400 opacity-60'
                }`}
              >
                {getStageIcon(stage, isActive, isCompleted)}
              </div>

              {/* Stage Label */}
              <div className="flex-1 min-w-0">
                <span className={`font-medium block ${
                  isActive 
                    ? 'text-white' 
                    : isCompleted 
                    ? 'text-synergy-ai-purple-light' 
                    : 'text-secondary opacity-60'
                }`}>
                  {stage}
                </span>
                {isActive && (
                  <span className="text-xs text-slate-400 block mt-1 truncate">
                    {getStageDescription(stage)}
                  </span>
                )}
              </div>

              {/* Connecting Line (except for last stage) */}
              {index < stages.length - 1 && (
                <div className="flex-1 relative mx-2 md:mx-4">
                  {/* Background Line - Only show for upcoming sections */}
                  {index >= currentIndex && (
                    <div className="absolute inset-0 h-1 rounded-full bg-secondary"></div>
                  )}
                  
                  {/* Progress Line - Shows completed sections and partial current progress */}
                  <div 
                    className={`h-1 rounded-full transition-all duration-1000 ease-out ${
                      index < currentIndex 
                        ? 'w-full bg-synergy-ai-purple'  // Lines BEFORE current stage are fully purple
                        : index === currentIndex 
                        ? 'w-1/2 bg-synergy-ai-primary'  // Current line is partially purple
                        : 'w-0 bg-transparent'           // Lines after current are empty
                    }`}
                  ></div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Progress Indicator */}
      <div className="mt-4 flex justify-between items-center text-sm text-secondary">
        <span>Progress: {((currentIndex + 1) / stages.length * 100).toFixed(0)}%</span>
        <span>{currentIndex + 1} of {stages.length} stages completed</span>
      </div>
    </div>
  );
};

export default StatusTracker;