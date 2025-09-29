import { FC } from 'react';
import { TeamMember } from '../../../../types';
import InviteMemberPanel from './InviteMemberPanel';
import TeamMembersTable from './TeamMembersTable';

interface TeamManagementSectionProps {
  teamMembers: TeamMember[];
  projectId: string;
  onTeamChange: () => void;
}

const TeamManagementSection: FC<TeamManagementSectionProps> = ({ teamMembers, projectId, onTeamChange }) => {
  return (
    <div className="space-y-6">
      <InviteMemberPanel projectId={projectId} onMemberInvited={onTeamChange} />
      <TeamMembersTable teamMembers={teamMembers} />
    </div>
  );
};
export default TeamManagementSection;
