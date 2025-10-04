// components/features/settings/ProfileHeader.tsx
import { FC } from 'react';
import { UserProfile } from '../../../types';
import { Edit } from 'lucide-react';

const ProfileHeader: FC<{ user: UserProfile }> = ({ user }) => (
    <div className="p-6 rounded-xl border border-border bg-surface/50 flex items-center justify-between">
        <div className="flex items-center gap-4">
            <div className="relative">
                {/* --- THE FIX: Using user.avatar_url --- */}
                <img src={user.avatar_url || `https://placehold.co/80x80/111827/FFFFFF?text=${user.name ? user.name.charAt(0).toUpperCase() : 'S'}`} alt="User Avatar" className="h-20 w-20 rounded-full"/>
                <button className="absolute bottom-0 right-0 p-1.5 bg-primary rounded-full text-white hover:bg-primary-hover">
                    <Edit size={12}/>
                </button>
            </div>
            <div>
                <h2 className="text-2xl font-bold text-white">{user.name || 'SynergyAI User'}</h2>
                <p className="text-secondary">{user.job_title || 'No title specified'}</p>
            </div>
        </div>
    </div>
);

export default ProfileHeader;