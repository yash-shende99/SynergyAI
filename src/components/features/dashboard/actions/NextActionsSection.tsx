import TaskList from './TaskList';
import {Button} from '../../../ui/button';
import { Slack, FileText, CalendarPlus } from 'lucide-react';

const NextActionsSection = () => {
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
          <Button variant="secondary" size="sm">
            <Slack size={16} className="mr-2" />
            Notify Team
          </Button>
          {/* --- THIS IS THE FIX --- */}
          {/* Change "primary" to "default" to match your button's available variants */}
          <Button variant="default" size="sm">
            + Create Task
          </Button>
        </div>
      </div>

      <div className="p-6 bg-surface/80 border border-border rounded-xl backdrop-blur-sm h-full">
        <TaskList />
      </div>
    </div>
  );
};

export default NextActionsSection;