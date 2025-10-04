// components/features/project/TeamMembersPanel.tsx
import { FC } from 'react';
import { Users, Plus, User } from 'lucide-react';
import { TeamMember } from '../../../types';

const TeamMembersPanel: FC<{ team: TeamMember[] }> = ({ team }) => {
  // Safe function to get avatar - uses icon if no name
  const renderAvatar = (member: TeamMember) => {
    if (member.avatarUrl) {
      return (
        <img 
          src={member.avatarUrl} 
          alt={member.name || 'User'} 
          className="h-8 w-8 rounded-full" 
        />
      );
    }
    
    if (member.name) {
      return (
        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-medium">
          {member.name.charAt(0).toUpperCase()}
        </div>
      );
    }
    
    // Fallback to icon
    return (
      <div className="h-8 w-8 rounded-full bg-border flex items-center justify-center">
        <User size={16} className="text-secondary" />
      </div>
    );
  };

  return (
    <div className="p-6 rounded-xl border border-border bg-surface/50 h-full">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-primary"/>
          <h3 className="text-lg font-bold text-white">Project Team</h3>
        </div>
        <button className="text-secondary hover:text-primary">
          <Plus size={20}/>
        </button>
      </div>
      <div className="space-y-3">
        {team && team.length > 0 ? (
          team.map(member => (
            <div key={member.id} className="flex items-center gap-3">
              {renderAvatar(member)}
              <div>
                <p className="text-sm font-medium text-white">
                  {member.name || 'Unknown User'}
                </p>
                <p className="text-xs text-secondary">
                  {member.role || 'Team Member'}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4">
            <Users className="h-12 w-12 text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-secondary">No team members</p>
            <p className="text-xs text-slate-500">Add team members to collaborate</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamMembersPanel;