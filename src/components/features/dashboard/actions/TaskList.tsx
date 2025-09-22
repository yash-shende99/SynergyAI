import TaskItem from './TaskItem';

const mockTasks = [
  { id: 1, text: 'Follow up with target CFO regarding employee retention agreements.', deal: 'Project Helios', isUrgent: true },
  { id: 2, text: 'Request updated financial projections for Q3 from AquaLogistics.', deal: 'Project Neptune', isUrgent: false },
  { id: 3, text: 'Set up legal diligence call with outside counsel for GeoFarms.', deal: 'Project Terra', isUrgent: true },
  { id: 4, text: 'Analyze competitor IPO filing for market impact.', deal: 'Project Helios', isUrgent: false },
];

const TaskList = () => {
  return (
    <div className="space-y-2">
      {mockTasks.map(task => (
        <TaskItem key={task.id} task={task} />
      ))}
    </div>
  );
};

export default TaskList;