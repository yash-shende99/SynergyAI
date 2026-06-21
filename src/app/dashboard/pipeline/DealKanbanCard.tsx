import { FC, useRef } from 'react';
import Link from 'next/link';
import { Project, DealStatus } from '../../../types';
import { supabase } from '../../../lib/supabaseClient';

// --- THIS IS THE FIX ---
// The props interface now correctly expects a 'project' of type 'Project'.
interface DealKanbanCardProps {
  project: Project;
}

const getStatusColor = (status: DealStatus) => {
  switch (status) {
    case 'Sourcing': return 'bg-green-500/30 text-green-300 border-green-500/50';
    case 'Diligence': return 'bg-amber-500/30 text-amber-300 border-amber-500/50';
    case 'Negotiation': return 'bg-blue-500/30 text-blue-300 border-blue-500/50';
    case 'Completed': return 'bg-gray-500/30 text-gray-300 border-gray-500/50';
  }
};

const DealKanbanCard: FC<DealKanbanCardProps> = ({ project }) => {
  const hasPrefetched = useRef(false);

  const handleMouseEnter = async () => {
    if (hasPrefetched.current) return;
    hasPrefetched.current = true;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      await fetch(`http://localhost:8000/api/projects/${project.id}/prefetch`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
    } catch (e) {
      console.error("Prefetch failed", e);
    }
  };

  return (
    <Link href={`/dashboard/project/${project.id}`}>
    <div onMouseEnter={handleMouseEnter} className="rounded-lg border border-border bg-surface/50 p-4 space-y-3 cursor-pointer hover:bg-surface/80 transition-colors">
      <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(project.status)}`}>
        {project.status}
      </span>
      <h4 className="font-bold text-white">Project: {project.name}</h4>
      <p className="text-sm text-secondary -mt-1">Target: {project.targetCompany.name}</p>

      <div className="flex -space-x-2 pt-2">
        {project.team.map(member => (
          <img
            key={member.id}
            className="inline-block h-6 w-6 rounded-full ring-2 ring-surface"
            src={
              member.avatarUrl ||
              `https://placehold.co/24x24/E2E8F0/111827?text=${member.name ? member.name.charAt(0) : 'U'
              }`
            }
            alt={member.name || 'Unknown user'}
            title={member.name || 'Unknown user'}
          />
        ))}
      </div>
    </div>
    </Link>
  );
};
export default DealKanbanCard;