import { FC } from 'react';
import { Button } from '../../../ui/button';
import { Download, UserPlus, ArrowLeft } from 'lucide-react';

interface MemoHeaderProps {
  projectName: string;
  onExport: () => void;
  onGoBack: () => void;
}

const MemoHeader: FC<MemoHeaderProps> = ({ projectName, onExport, onGoBack }) => (
  <div>
    <button
      onClick={onGoBack}
      className="flex items-center gap-2 text-sm text-secondary hover:text-white mb-4 transition-colors"
    >
      <ArrowLeft size={16} /> Back to Generation
    </button>

    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-bold text-white">
          Investment Memo: <span className="text-primary">{projectName}</span>
        </h2>
        <p className="text-sm text-secondary mt-1">
          AI-generated investment analysis and recommendations
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button onClick={onExport} variant="default" size="sm">
          <Download size={16} className="mr-2" />
          Export
        </Button>
      </div>
    </div>
  </div>
);

export default MemoHeader;