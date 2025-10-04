import { FC } from 'react';
import { ProjectTask, TaskPriority } from '../../../../types';
import { ChevronsUp, ChevronUp, ChevronsDown } from 'lucide-react';

const getPriorityIcon = (priority: TaskPriority) => {
    switch(priority) {
        case 'High': return <ChevronsUp size={16} className="text-red-400"/>;
        case 'Medium': return <ChevronUp size={16} className="text-amber-400"/>;
        case 'Low': return <ChevronsDown size={16} className="text-green-400"/>;
    }
}

const TaskCard: FC<{ task: ProjectTask }> = ({ task }) => (
  <div className="p-3 rounded-lg bg-surface/50 border border-border hover:border-primary cursor-pointer">
    <p className="text-sm font-medium text-white">{task.title}</p>
    <div className="flex justify-between items-center mt-2">
      <div className="flex items-center gap-1 text-xs">
        {getPriorityIcon(task.priority)}
        <span className="text-secondary">{task.priority}</span>
      </div>
      
      {/* --- THIS IS THE DEFINITIVE FIX --- */}
      {/* We now safely check if the 'assignedTo' object and its 'name' property exist before trying to use them. */}
      {task.assignedTo && (
        <img 
          src={task.assignedTo.avatarUrl || `https://placehold.co/24x24/1F2937/9CA3AF?text=${
            task.assignedTo.name ? task.assignedTo.name.charAt(0).toUpperCase() : '?'
          }`}
          alt={task.assignedTo.name || "Unassigned"} 
          title={task.assignedTo.name || "Unassigned"}
          className="h-6 w-6 rounded-full"
        />
      )}
      {/* --- END OF FIX --- */}
    </div>
  </div>
);

export default TaskCard;

