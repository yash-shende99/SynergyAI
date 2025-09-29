import { FC } from 'react';
import { TeamMember } from '../../../../types';
import { Trash2, UserX } from 'lucide-react';

const TeamMembersTable: FC<{ teamMembers: TeamMember[] }> = ({ teamMembers }) => (
  <div className="p-4 rounded-xl border border-border bg-surface/50">
    <h3 className="font-semibold text-white mb-4">Current Team</h3>
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm min-w-[400px]">
        <thead className="border-b border-border text-xs text-secondary">
          <tr>
            <th className="p-2 font-medium">Member</th>
            <th className="p-2 font-medium">Role</th>
            <th className="p-2 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {teamMembers && teamMembers.length > 0 ? (
            teamMembers.map(member => (
              <tr key={member.id} className="border-b border-border/50">
                <td className="p-2">
                  <div className="flex items-center gap-3">
                    <img 
                      // --- THIS IS THE DEFINITIVE FIX ---
                      // We now safely handle cases where name or avatar might be null.
                      src={member.avatarUrl || `https://placehold.co/32x32/111827/FFFFFF?text=${member.name ? member.name.charAt(0).toUpperCase() : '?'}`} 
                      className="h-8 w-8 rounded-full" 
                      alt={member.name || "Unknown User"}
                    />
                    <div>
                      <p className="font-medium text-white">{member.name || "Invited User"}</p>
                      <p className="text-xs text-secondary">{member.email || "No email"}</p>
                    </div>
                  </div>
                </td>
                <td className="p-2">
                  <span className="px-2 py-1 bg-surface rounded-full text-xs text-slate-300">
                    {member.role || 'Viewer'}
                  </span>
                </td>
                <td className="p-2 text-right">
                  <button className="text-secondary hover:text-red-500 p-1">
                    <Trash2 size={16}/>
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} className="text-center text-secondary py-8">
                <UserX size={32} className="mx-auto mb-2 opacity-50"/>
                <p>No team members have been added to this project yet.</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

export default TeamMembersTable;

