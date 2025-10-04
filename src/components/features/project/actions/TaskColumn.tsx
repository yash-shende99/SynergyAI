// components/features/project/actions/TaskColumn.tsx
import { FC } from 'react';
import { ProjectTask, TaskStatus } from '../../../../types';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import TaskCard from './TaskCard';

interface TaskColumnProps {
  status: TaskStatus;
  tasks: ProjectTask[];
}

const statusConfig = {
  'To Do': { bg: 'bg-blue-500/10', text: 'text-blue-300' },
  'In Progress': { bg: 'bg-amber-500/10', text: 'text-amber-300' },
  'Done': { bg: 'bg-green-500/10', text: 'text-green-300' },
};

const TaskColumn: FC<TaskColumnProps> = ({ status, tasks }) => (
  <div className={`p-4 rounded-xl border border-border ${statusConfig[status].bg}`}>
    <h3 className={`font-semibold mb-4 ${statusConfig[status].text}`}>{status} ({tasks.length})</h3>
    <Droppable droppableId={status}>
      {(provided, snapshot) => (
        <div {...provided.droppableProps} ref={provided.innerRef} className={`space-y-3 min-h-[200px] rounded-lg p-1 ${snapshot.isDraggingOver ? 'bg-surface/50' : ''}`}>
          {tasks.map((task, index) => (
            <Draggable key={task.id} draggableId={task.id} index={index}>
              {(provided) => (
                <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                  <TaskCard task={task} />
                </div>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  </div>
);
export default TaskColumn;