'use client';

import { FC } from 'react';
import { Invitation } from '../../../../types';
import {Button} from '../../../ui/button';
import { Mail, Trash2, Send } from 'lucide-react';
import { supabase } from '../../../../lib/supabaseClient';

interface InvitationsTableProps {
  invitations: Invitation[];
  onInvitationChange: () => void;
}

const InvitationsTable: FC<InvitationsTableProps> = ({ invitations, onInvitationChange }) => {
  
  const handleResend = async (invitationId: string) => {
    // Call the resend API endpoint
    alert(`Resending invitation ${invitationId}...`);
  };

  const handleRevoke = async (invitationId: string, email: string) => {
    if (!confirm(`Are you sure you want to revoke the invitation for ${email}?`)) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    try {
        await fetch(`http://localhost:8000/api/invitations/${invitationId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${session.access_token}` }
        });
        onInvitationChange(); // Refresh the list
    } catch (error) {
        alert("Failed to revoke invitation.");
    }
  };

  return (
    <div className="p-4 rounded-xl border border-border bg-surface/50">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border text-xs text-secondary">
          <tr><th className="p-2">Email</th><th className="p-2">Role</th><th className="p-2">Invited On</th><th className="p-2 text-right">Actions</th></tr>
        </thead>
        <tbody>
          {invitations.length > 0 ? invitations.map(invite => (
            <tr key={invite.id} className="border-b border-border/50">
              <td className="p-2 font-medium text-white">{invite.invited_email}</td>
              <td className="p-2"><span className="px-2 py-1 bg-surface rounded-full text-xs">{invite.role}</span></td>
              <td className="p-2 text-secondary">{new Date(invite.created_at).toLocaleDateString()}</td>
              <td className="p-2 text-right space-x-2">
                <Button onClick={() => handleResend(invite.id)} variant="ghost" size="icon" title="Resend Invitation"><Send size={16}/></Button>
                <Button onClick={() => handleRevoke(invite.id, invite.invited_email)} variant="ghost" size="icon" className="hover:text-red-500" title="Revoke Invitation"><Trash2 size={16}/></Button>
              </td>
            </tr>
          )) : (
            <tr><td colSpan={4} className="text-center text-secondary py-8"><Mail size={32} className="mx-auto mb-2 opacity-50"/><p>No pending invitations.</p></td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
export default InvitationsTable;
