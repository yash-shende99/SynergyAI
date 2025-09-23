import { FC } from 'react';
import { Users, Plus } from 'lucide-react';
import { Project } from '../../../types';

const TeamMembersPanel: FC<{ team: Project['team'] }> = ({ team }) => (
  <div className="p-6 rounded-xl border border-border bg-surface/50 h-full">
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center gap-3">
        <Users className="h-6 w-6 text-primary"/>
        <h3 className="text-lg font-bold text-white">Project Team</h3>
      </div>
      <button className="text-secondary hover:text-primary"><Plus size={20}/></button>
    </div>
    <div className="space-y-3">
      {/* --- THIS IS THE FIX --- */}
      {/* The component now correctly uses the richer TeamMember object. */}
      {team.map(member => (
        <div key={member.id} className="flex items-center gap-3">
          <img src={member.avatarUrl} alt={member.name} className="h-8 w-8 rounded-full" />
          <div>
            <p className="text-sm font-medium text-white">{member.name}</p>
            {/* We can now display the member's role */}
            <p className="text-xs text-secondary">{member.role}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default TeamMembersPanel;

