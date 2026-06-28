import { useState } from 'react';
import TaskList from './TaskList';
import { Button } from '../../../ui/button';
import CreateTaskModal from './CreateTaskModal';

const NextActionsSection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshCounter, setRefreshCounter] = useState(0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Global Task Board</h2>
          <p className="mt-1 text-secondary">
            AI-suggested and manually-created tasks from all active deals.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="default" size="sm" onClick={() => setIsModalOpen(true)}>
            + Create Task
          </Button>
        </div>
      </div>

      <div className="p-6 bg-surface/80 border border-border rounded-xl backdrop-blur-sm h-full">
        <TaskList refreshTrigger={refreshCounter} />
      </div>

      <CreateTaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onTaskCreated={() => setRefreshCounter(prev => prev + 1)}
      />
    </div>
  );
};

export default NextActionsSection;