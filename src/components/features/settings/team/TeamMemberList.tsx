import { FC } from 'react';
import { TeamMember } from '../../../../types';
import { Trash2 } from 'lucide-react';

const TeamMemberList: FC<{ members: TeamMember[] }> = ({ members }) => (
    <div className="space-y-2">
        {members.map(member => (
            <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface/50">
                <img src={member.avatarUrl} alt={member.name} className="h-8 w-8 rounded-full"/>
                <div className="flex-1">
                    <p className="font-medium text-white text-sm">{member.name}</p>
                    <p className="text-xs text-secondary">{member.email}</p>
                </div>
                <select defaultValue={member.role} className="bg-background border border-border rounded-md px-2 py-1 text-xs">
                    <option>Admin</option><option>Editor</option><option>Viewer</option>
                </select>
                <button className="text-secondary hover:text-red-500 p-1"><Trash2 size={16}/></button>
            </div>
        ))}
    </div>
);
export default TeamMemberList;