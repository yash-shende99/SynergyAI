import { FC } from 'react';
import { SynergyProfile } from '../../../../types';
import {Button} from '../../../ui/button';
import { Save, Download, Share2, ArrowLeft } from 'lucide-react'; // <-- 1. Import ArrowLeft
import Link from 'next/link'; // <-- 2. Import Link

const WorkspaceHeader: FC<{ profile: SynergyProfile }> = ({ profile }) => (
    <div>
        {/* --- THIS IS THE NEW BACK BUTTON --- */}
        <Link 
            href="/dashboard/valuation/synergies" 
            className="flex items-center gap-2 text-sm text-secondary hover:text-white mb-2"
        >
            <ArrowLeft size={16}/> Back to Synergy Models
        </Link>
    <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">
            Synergy Analysis: <span className="text-primary">{profile.acquirer.name} + {profile.target.name}</span>
        </h2>
        <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm"><Share2 size={16} className="mr-2"/>Share</Button>
            <Button variant="secondary" size="sm"><Download size={16} className="mr-2"/>Export</Button>
            <Button variant="default" size="sm"><Save size={16} className="mr-2"/>Save</Button>
        </div>
    </div>
     </div>
);
export default WorkspaceHeader;