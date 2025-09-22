'use client';

import { Users, Plus } from 'lucide-react';
import {Button} from '../../../ui/button';
import { TeamMember } from '../../../../types';
import TeamMemberList from '../team/TeamMemberList';

const mockTeam: TeamMember[] = [
    {id: 'user-1', name: 'Yash Shende', email: 'yash@synergy.ai', avatarUrl: 'https://placehold.co/32x32/E2E8F0/111827?text=YS', role: 'Admin'},
    {id: 'user-2', name: 'Priya Gupta', email: 'priya@synergy.ai', avatarUrl: 'https://placehold.co/32x32/FBCFE8/831843?text=PG', role: 'Editor'},
    {id: 'user-3', name: 'Raj Mehta', email: 'raj@synergy.ai', avatarUrl: 'https://placehold.co/32x32/BAE6FD/0C4A6E?text=RM', role: 'Viewer'},
];

export default function TeamSection() {
  return (
    <div className="p-6 rounded-xl border border-border bg-surface/50">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-primary"/>
            <h3 className="text-lg font-bold text-white">Team Management</h3>
        </div>
        <Button variant="default" size="sm"><Plus size={16} className="mr-2"/>Invite Member</Button>
      </div>
      <TeamMemberList members={mockTeam} />
    </div>
  );
}