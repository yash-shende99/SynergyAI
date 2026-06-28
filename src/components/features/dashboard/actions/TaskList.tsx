import { useState, useEffect } from 'react';
import TaskItem from './TaskItem';
import { supabase } from '../../../../lib/supabaseClient';
import { Loader2 } from 'lucide-react';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  project_name: string;
  project_id: string;
}

const TaskList = ({ refreshTrigger = 0 }: { refreshTrigger?: number }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTasks = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const response = await fetch('http://localhost:8000/api/user/tasks', {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const data = await response.json();
      setTasks(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [refreshTrigger]);

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>;
  if (error) return <div className="text-red-400 p-4">{error}</div>;

  const statuses = ['To Do', 'In Progress', 'Done'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {statuses.map(status => {
        const columnTasks = tasks.filter(t => t.status === status);
        return (
          <div key={status} className="bg-background/40 p-4 rounded-xl border border-border/50 max-h-[650px] overflow-y-auto custom-scrollbar">
            <h3 className="text-lg font-semibold text-white mb-4 flex justify-between sticky top-0 bg-background/40 backdrop-blur-md pb-2 z-10">
              {status}
              <span className="bg-surface px-2 py-0.5 rounded-full text-xs text-secondary">{columnTasks.length}</span>
            </h3>
            <div className="space-y-3">
              {columnTasks.map(task => (
                <TaskItem key={task.id} task={task} onStatusChange={fetchTasks} />
              ))}
              {columnTasks.length === 0 && (
                <div className="text-center p-4 text-secondary/50 text-sm border-2 border-dashed border-border/50 rounded-lg">
                  No tasks
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TaskList;