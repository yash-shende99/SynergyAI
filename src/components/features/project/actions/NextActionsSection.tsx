// components/features/project/actions/NextActionsSection.tsx
'use client';

import { FC, useState, useEffect } from 'react';
import { ProjectTask, TaskStatus } from '../../../../types';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import TaskColumn from './TaskColumn';
import {Button} from '../../../ui/button';
import { Zap, Loader2 } from 'lucide-react';
import { supabase } from '../../../../lib/supabaseClient';

interface NextActionsSectionProps {
  initialTasks: ProjectTask[];
  projectId: string;
  onTasksChange: () => void;
}

const NextActionsSection: FC<NextActionsSectionProps> = ({ initialTasks, projectId, onTasksChange }) => {
  const [tasks, setTasks] = useState(initialTasks);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const handleGenerateAiTasks = async () => {
    setIsGenerating(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { alert("Please log in"); return; }
    try {
        await fetch(`http://localhost:8000/api/projects/${projectId}/generate_tasks`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${session.access_token}` }
        });
        onTasksChange();
    } catch (error) {
        alert("Failed to generate AI tasks.");
    } finally {
        setIsGenerating(false);
    }
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;
    
    const movedTask = tasks.find(t => t.id === draggableId);
    if (!movedTask) return;
    
    const newTasks = tasks.map(t => t.id === draggableId ? { ...t, status: destination.droppableId as TaskStatus } : t);
    setTasks(newTasks);

    updateTaskStatus(draggableId, destination.droppableId as TaskStatus);
  };
  
  const updateTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    try {
        await fetch(`http://localhost:8000/api/tasks/${taskId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
            body: JSON.stringify({ status: newStatus })
        });
    } catch (error) {
        console.error("Failed to update task status:", error);
        setTasks(initialTasks); // Revert on failure
    }
  };

  const columns: TaskStatus[] = ['To Do', 'In Progress', 'Done'];

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">AI Action Board</h2>
            <Button onClick={handleGenerateAiTasks} disabled={isGenerating}>
              {isGenerating ? <><Loader2 size={16} className="mr-2 animate-spin"/>Generating...</> : <><Zap size={16} className="mr-2"/>Generate with AI</>}
            </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {columns.map(status => (
            <TaskColumn 
              key={status} 
              status={status} 
              tasks={tasks.filter(t => t.status === status)}
            />
          ))}
        </div>
      </div>
    </DragDropContext>
  );
};
export default NextActionsSection;