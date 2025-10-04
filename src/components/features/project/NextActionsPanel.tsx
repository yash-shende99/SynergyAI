// components/features/project/NextActionsPanel.tsx
import { FC } from 'react';
import { ClipboardList, Plus, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { ProjectTask } from '../../../types';
import { Button } from '../../ui/button';

const NextActionsPanel: FC<{ tasks: ProjectTask[] }> = ({ tasks }) => {
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'High': return <AlertCircle className="h-4 w-4 text-red-400" />;
      case 'Medium': return <Clock className="h-4 w-4 text-amber-400" />;
      default: return <CheckCircle className="h-4 w-4 text-green-400" />;
    }
  };

  return (
    <div className="p-6 rounded-xl border border-border bg-surface/50 h-full">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <ClipboardList className="h-6 w-6 text-primary"/>
          <h3 className="text-lg font-bold text-white">Priority Actions</h3>
        </div>
        <Button variant="secondary" size="sm">
          <Plus size={16} className="mr-2"/>
          New Task
        </Button>
      </div>
      <div className="space-y-3">
        {tasks.length > 0 ? tasks.map(task => (
          <div 
            key={task.id} 
            className="flex items-center gap-3 p-3 rounded-lg bg-surface/30 border border-border hover:border-primary/30 transition-colors"
          >
            {getPriorityIcon(task.priority)}
            <div className="flex-1">
              <p className="text-sm font-medium text-white">{task.title}</p>
              {task.description && (
                <p className="text-xs text-secondary mt-1">{task.description}</p>
              )}
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${
              task.priority === 'High' ? 'bg-red-500/20 text-red-400' :
              task.priority === 'Medium' ? 'bg-amber-500/20 text-amber-400' :
              'bg-green-500/20 text-green-400'
            }`}>
              {task.priority}
            </span>
          </div>
        )) : (
          <div className="text-center py-8">
            <ClipboardList className="h-12 w-12 text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-secondary">No priority actions pending</p>
            <p className="text-xs text-slate-500 mt-1">All tasks are up to date</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NextActionsPanel;