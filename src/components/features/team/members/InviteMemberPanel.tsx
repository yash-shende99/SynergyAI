'use client';

import { FC, useState } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import {Button} from '../../../ui/button';
import { UserPlus, Loader2 } from 'lucide-react';

interface InviteMemberPanelProps {
  projectId: string;
  onMemberInvited: () => void;
}

const InviteMemberPanel: FC<InviteMemberPanelProps> = ({ projectId, onMemberInvited }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'Editor' | 'Viewer'>('Editor');
  const [isLoading, setIsLoading] = useState(false);

  const handleInvite = async () => {
    if (!email.trim()) return;
    setIsLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { alert("Please log in"); return; }

    try {
      const response = await fetch(`http://localhost:8000/api/projects/${projectId}/team/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify({ email, role })
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail);
      }
      alert("Invitation sent successfully!");
      setEmail('');
      onMemberInvited();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 rounded-xl border border-border bg-surface/50">
      <div className="flex items-center gap-2 mb-2"><UserPlus size={18}/><h3 className="font-semibold text-white">Invite New Member</h3></div>
      <div className="flex flex-col sm:flex-row gap-2">
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="teammate@email.com" className="flex-1 bg-background ..."/>
        <select value={role} onChange={e => setRole(e.target.value as any)} className="bg-background ..."><option>Editor</option><option>Viewer</option></select>
        <Button onClick={handleInvite} disabled={isLoading}>{isLoading ? <Loader2 className="animate-spin"/> : 'Send Invite'}</Button>
      </div>
    </div>
  );
};
export default InviteMemberPanel;
