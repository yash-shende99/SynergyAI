// components/features/project/NextActionsPanel.tsx
import { FC, useState } from 'react';
import { ClipboardList, Plus, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { ProjectTask } from '../../../types';
import { Button } from '../../../components/ui/button';
import { supabase } from '../../../lib/supabaseClient';

interface NextActionsPanelProps {
  tasks: ProjectTask[];
  projectId: string;
}

const NextActionsPanel: FC<NextActionsPanelProps> = ({ tasks, projectId }) => {
  const [isCreating, setIsCreating] = useState(false);

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'High': return <AlertCircle className="h-4 w-4 text-red-400" />;
      case 'Medium': return <Clock className="h-4 w-4 text-amber-400" />;
      default: return <CheckCircle className="h-4 w-4 text-green-400" />;
    }
  };

  const handleCreateTask = async () => {
    setIsCreating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(`http://localhost:8000/api/projects/${projectId}/generate_tasks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });

      if (response.ok) {
        // Refresh the page to show new tasks
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to generate tasks:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="p-6 rounded-xl border border-border bg-surface/50 h-full">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <ClipboardList className="h-6 w-6 text-primary"/>
          <h3 className="text-lg font-bold text-white">Priority Actions</h3>
        </div>
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={handleCreateTask}
          disabled={isCreating}
        >
          <Plus size={16} className="mr-2"/>
          {isCreating ? 'Generating...' : 'AI Suggest Tasks'}
        </Button>
      </div>
      <div className="space-y-3">
        {tasks && tasks.length > 0 ? tasks.map(task => (
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
            <p className="text-xs text-slate-500 mt-1">Click above to generate AI-suggested tasks</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NextActionsPanel;