import { FC } from 'react';

// Define the shape of the project data we expect
interface Project {
  id: string;
  name: string;
  status: 'In Progress' | 'Completed' | 'On Hold';
  lastActivity: string;
}

interface ProjectCardProps {
  project: Project;
}

// A helper to get a color based on the project status
const getStatusColor = (status: Project['status']) => {
  switch (status) {
    case 'In Progress':
      return 'bg-blue-500';
    case 'Completed':
      return 'bg-green-500';
    case 'On Hold':
      return 'bg-amber-500';
  }
};

const ProjectCard: FC<ProjectCardProps> = ({ project }) => {
  return (
    // Base card styling with glassmorphism and animated border
    <div className="group rounded-xl border border-slate-700 bg-slate-800/60 p-6 backdrop-blur-lg transition-all duration-300 hover:border-blue-500/50 hover:bg-slate-800/80">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-bold text-slate-100">{project.name}</h3>
        <span
          className={`px-3 py-1 text-xs font-semibold text-white rounded-full ${getStatusColor(
            project.status
          )}`}
        >
          {project.status}
        </span>
      </div>
      <p className="mt-4 text-sm text-slate-400">
        Last activity: {project.lastActivity}
      </p>
      <button className="mt-6 text-sm font-semibold text-blue-400 transition-colors group-hover:text-blue-300">
        Open Workspace →
      </button>
    </div>
  );
};

export default ProjectCard;
