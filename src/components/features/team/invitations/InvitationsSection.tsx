import { FC } from 'react';
import { Invitation } from '../../../../types';
import InvitationsTable from './InvitationsTable';

interface InvitationsSectionProps {
  invitations: Invitation[];
  onInvitationChange: () => void;
}

const InvitationsSection: FC<InvitationsSectionProps> = ({ invitations, onInvitationChange }) => (
  <div className="space-y-6">
    <div>
        <h2 className="text-2xl font-bold text-white">Pending Invitations</h2>
        <p className="text-secondary mt-1">Manage outstanding invitations for this project.</p>
    </div>
    <InvitationsTable 
      invitations={invitations} 
      onInvitationChange={onInvitationChange} 
    />
  </div>
);

export default InvitationsSection;
