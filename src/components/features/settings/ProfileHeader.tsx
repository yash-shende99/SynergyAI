import {Button} from '../../ui/button';
import { Edit } from 'lucide-react';

const ProfileHeader = () => (
    <div className="p-6 rounded-xl border border-border bg-surface/50 flex items-center justify-between">
        <div className="flex items-center gap-4">
            <div className="relative">
                <img src="https://placehold.co/80x80/E2E8F0/111827?text=YS" alt="User Avatar" className="h-20 w-20 rounded-full"/>
                <button className="absolute bottom-0 right-0 p-1.5 bg-primary rounded-full text-white hover:bg-primary-hover">
                    <Edit size={12}/>
                </button>
            </div>
            <div>
                <h2 className="text-2xl font-bold text-white">Yash Shende</h2>
                <p className="text-secondary">Lead Analyst, SynergyAI</p>
            </div>
        </div>
        <Button variant="default" size="sm">Save Changes</Button>
    </div>
);

export default ProfileHeader;