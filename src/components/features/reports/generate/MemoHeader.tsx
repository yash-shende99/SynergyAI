import { FC } from 'react';
import {Button} from '../../../ui/button';
import { Save, Download, UserPlus, ArrowLeft } from 'lucide-react';

interface MemoHeaderProps {
  projectName: string;
  onSave: () => void;
  onExport: () => void;
  onGoBack: () => void;
}

const MemoHeader: FC<MemoHeaderProps> = ({ projectName, onSave, onExport, onGoBack }) => (
    <div>
        {/* --- THIS IS THE NEW BACK BUTTON --- */}
        <button 
            onClick={onGoBack}
            className="flex items-center gap-2 text-sm text-secondary hover:text-white mb-2"
        >
            <ArrowLeft size={16}/> Change Project
        </button>
    <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Investment Memo: <span className="text-primary">{projectName}</span></h2>
        <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm"><UserPlus size={16} className="mr-2"/>Invite Reviewer</Button>
            <Button onClick={onExport} variant="secondary" size="sm"><Download size={16} className="mr-2"/>Export</Button>
            <Button onClick={onSave} variant="default" size="sm"><Save size={16} className="mr-2"/>Save to Drafts</Button>
        </div>
    </div>
    </div>
);
export default MemoHeader;