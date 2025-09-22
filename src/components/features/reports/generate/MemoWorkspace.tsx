import { FC } from 'react';
import { BriefingCard as BriefingCardType } from '../../../../types';
import MemoHeader from './MemoHeader';
import BriefingDashboard from './BriefingDashboard';
import EditableMemo from './EditableMemo';
import ContextSidebar from './ContextSidebar';

interface MemoWorkspaceProps {
  projectName: string;
  briefingData: BriefingCardType[];
  onCardClick: (card: BriefingCardType) => void;
  onSave: () => void;
  onExport: () => void;
  onGoBack: () => void;
}

const MemoWorkspace: FC<MemoWorkspaceProps> = ({ projectName, briefingData, onCardClick, onSave, onExport, onGoBack }) => (
  <div className="space-y-6">
    <MemoHeader projectName={projectName} onSave={onSave} onExport={onExport} onGoBack={onGoBack} />
    <BriefingDashboard cards={briefingData} onCardClick={onCardClick} />
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-8">
        <EditableMemo />
      </div>
      <div className="lg:col-span-4">
        <ContextSidebar />
      </div>
    </div>
  </div>
);

export default MemoWorkspace;