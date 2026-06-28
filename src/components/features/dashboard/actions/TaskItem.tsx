import { FC } from 'react';
import { UserPlus, Calendar, MoreHorizontal, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Task } from './TaskList';
import { supabase } from '../../../../lib/supabaseClient';

interface TaskItemProps {
  task: Task;
  onStatusChange: () => void;
}

const TaskItem: FC<TaskItemProps> = ({ task, onStatusChange }) => {
  const isUrgent = task.priority === 'High';

  const moveTask = async (newStatus: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      await fetch(`http://localhost:8000/api/tasks/${task.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      onStatusChange();
    } catch (e) {
      console.error("Failed to move task", e);
    }
  };

  return (
    <div className="flex flex-col gap-2 p-3 rounded-lg bg-surface/50 border border-border hover:bg-surface/80 transition-colors group">
      <div className="flex items-start gap-3">
        <button 
          onClick={() => moveTask(task.status === 'Done' ? 'To Do' : 'Done')}
          className={`mt-1 flex-shrink-0 h-5 w-5 rounded border flex items-center justify-center transition-colors
            ${task.status === 'Done' ? 'bg-primary border-primary text-white' : 'border-secondary hover:border-primary text-transparent hover:text-primary/50'}
          `}
        >
          <CheckCircle2 size={14} />
        </button>
        
        <div className="flex-1 min-w-0">
          <p className={`font-medium text-sm leading-tight ${task.status === 'Done' ? 'text-secondary line-through' : 'text-white'}`}>
            {task.title}
          </p>
          <p className="text-xs text-secondary mt-1 truncate">{task.description}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${isUrgent ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-background text-secondary border border-border'}`}>
              {task.priority || 'Normal'}
            </span>
            <span className="text-[10px] text-secondary truncate px-2 py-0.5 rounded-full bg-background border border-border">
              {task.project_name}
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-end gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {task.status === 'To Do' && (
          <button onClick={() => moveTask('In Progress')} className="p-1.5 text-xs text-secondary hover:text-white bg-background rounded-md flex items-center gap-1 border border-border hover:border-secondary">
            Start <ArrowRight size={12} />
          </button>
        )}
        {task.status === 'In Progress' && (
          <button onClick={() => moveTask('Done')} className="p-1.5 text-xs text-secondary hover:text-white bg-background rounded-md flex items-center gap-1 border border-border hover:border-secondary">
            Complete <CheckCircle2 size={12} />
          </button>
        )}
      </div>
    </div>
  );
};

export default TaskItem;