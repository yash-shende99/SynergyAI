import { FC } from 'react';
import DealFunnelVisualization from './DealFunnelVisualization';
import DealKanbanCard from './DealKanbanCard';
import { Project } from '../../../types';
import {Button} from '../../../components/ui/button';
import { Plus } from 'lucide-react';

// --- THIS IS THE FIX ---
// The props interface is now clean and correct. It only expects what it needs.
interface PipelineSectionProps {
  projects: Project[];
  onOpenCreateModal: () => void;
}

const PipelineSection: FC<PipelineSectionProps> = ({ projects, onOpenCreateModal }) => {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Deal Pipeline</h2>
          <Button onClick={onOpenCreateModal} variant="default" size="sm">
              <Plus size={16} className="mr-2"/>Create Project
          </Button>
      </div>
      
      <DealFunnelVisualization projects={projects} />
      
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {projects.map(project => (
            <DealKanbanCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="text-center text-secondary py-16">
          <p className="font-semibold">No active projects.</p>
          <p className="text-sm mt-1">Click "+ Create Project" to start your first deal analysis.</p>
        </div>
      )}
    </div>
  );
};

export default PipelineSection;