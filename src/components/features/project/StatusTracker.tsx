import { FC, useState } from 'react';
import { DealStatus } from '../../../types';
import { CheckCircle, Loader2 } from 'lucide-react';

const stages: DealStatus[] = ['Sourcing', 'Diligence', 'Negotiation', 'Completed'];

const StatusTracker: FC< { currentStatus: DealStatus; onStatusChange?: (newStatus: DealStatus) => void }> = ({ 
  currentStatus, 
  onStatusChange 
}) => {
  const [loadingStage, setLoadingStage] = useState<DealStatus | null>(null);
  const currentIndex = stages.indexOf(currentStatus);

  const handleStageClick = async (stage: DealStatus, index: number) => {
    // Only allow clicking on current or next stage
    if (index > currentIndex + 1 || index < currentIndex) {
      return;
    }

    setLoadingStage(stage);
    
    try {
      // Simulate API call or any async operation
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (onStatusChange) {
        onStatusChange(stage);
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setLoadingStage(null);
    }
  };

  return (
    <div className="p-6 rounded-xl border border-border bg-surface/50">
      <div className="flex items-center justify-between">
        {stages.map((stage, index) => {
          const isCompleted = index < currentIndex;
          const isActive = index === currentIndex;
          const isClickable = index <= currentIndex + 1 && index >= currentIndex;
          const isLoading = loadingStage === stage;

          return (
            <div key={stage} className="flex-1 flex items-center gap-2">
              {/* Stage Circle */}
              <button
                onClick={() => isClickable && handleStageClick(stage, index)}
                disabled={!isClickable || isLoading}
                className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  isLoading ? 'bg-primary/80 scale-110' :
                  isActive ? 'bg-primary text-white ring-4 ring-primary/20 shadow-lg' : 
                  isCompleted ? 'bg-green-500 text-white shadow-md' : 
                  isClickable ? 'bg-border text-secondary hover:bg-primary/20 hover:text-primary cursor-pointer' : 
                  'bg-border text-secondary opacity-50 cursor-not-allowed'
                } ${isClickable ? 'hover:scale-105' : ''}`}
              >
                {isLoading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : isCompleted ? (
                  <CheckCircle size={16} className="text-white" />
                ) : (
                  index + 1
                )}
              </button>

              {/* Stage Label */}
              <span className={`font-medium transition-colors ${
                isActive ? 'text-white' : 
                isCompleted ? 'text-green-400' : 
                'text-secondary'
              } ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}>
                {stage}
              </span>

              {/* Connecting Line (except for last stage) */}
              {index < stages.length - 1 && (
                <div className="flex-1 relative mx-4">
                  {/* Background Line */}
                  <div className="absolute inset-0 h-1 rounded-full bg-border"></div>
                  
                  {/* Progress Line */}
                  <div 
                    className={`h-1 rounded-full bg-primary transition-all duration-1000 ease-out ${
                      isCompleted ? 'w-full' : 
                      isActive ? 'w-1/2' : 
                      'w-0'
                    } ${isLoading ? 'animate-pulse' : ''}`}
                  ></div>
                  
                  {/* Animated Dot for Active Progress */}
                  {isActive && !isLoading && (
                    <div className="absolute top-1/2 left-0 w-3 h-3 bg-primary rounded-full -translate-y-1/2 -translate-x-1/2 animate-bounce"></div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Status Description */}
      <div className="mt-4 text-center">
        <p className="text-sm text-secondary">
          {loadingStage ? (
            <>Updating to <span className="text-primary font-medium">{loadingStage}</span>...</>
          ) : (
            <>Current stage: <span className="text-primary font-medium">{currentStatus}</span></>
          )}
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Click on current or next stage to update progress
        </p>
      </div>
    </div>
  );
};

export default StatusTracker;