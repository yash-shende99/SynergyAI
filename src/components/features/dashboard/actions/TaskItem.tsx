import { FC } from 'react';
import { UserPlus, Calendar, MoreHorizontal } from 'lucide-react';

interface Task {
  id: number;
  text: string;
  deal: string;
  isUrgent: boolean;
}

interface TaskItemProps {
  task: Task;
}

const TaskItem: FC<TaskItemProps> = ({ task }) => {
  return (
    <div className="flex items-center gap-4 p-3 rounded-lg bg-background/50 hover:bg-surface/80 transition-colors group">
      <input 
        type="checkbox" 
        className="h-5 w-5 rounded bg-surface border-border text-primary focus:ring-primary focus:ring-offset-background" 
      />
      <div className="flex-1">
        <p className="font-medium text-white">{task.text}</p>
        <span className={`text-xs ${task.isUrgent ? 'text-amber-400' : 'text-secondary'}`}>
          {task.isUrgent && 'Urgent • '}{task.deal}
        </span>
      </div>
      <div className="flex items-center gap-2 text-secondary opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="p-1 hover:text-white"><UserPlus size={16} /></button>
        <button className="p-1 hover:text-white"><Calendar size={16} /></button>
        <button className="p-1 hover:text-white"><MoreHorizontal size={16} /></button>
      </div>
    </div>
  );
};

export default TaskItem;