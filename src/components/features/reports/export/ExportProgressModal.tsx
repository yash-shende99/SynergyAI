import { FC } from 'react';
import Modal from '../../../ui/Modal';
import { CheckCircle, Clock } from 'lucide-react';
import {Button} from '../../../ui/button';

interface ExportProgressModalProps {
  state: 'idle' | 'exporting' | 'complete';
  progress: number;
  onClose: () => void;
}

const ExportProgressModal: FC<ExportProgressModalProps> = ({ state, progress, onClose }) => {
  if (state === 'idle') return null;

  return (
    <Modal isOpen={true} onClose={onClose} title={state === 'complete' ? 'Export Complete' : 'Exporting Reports...'}>
      <div className="text-center">
        {state === 'exporting' && (
          <>
            <Clock size={48} className="mx-auto text-primary animate-spin mb-4"/>
            <p className="text-secondary mb-2">Your documents are being generated...</p>
            <div className="w-full bg-border rounded-full h-2.5">
              <div className="bg-primary h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
            <p className="text-sm font-semibold text-white mt-2">{Math.round(progress)}%</p>
          </>
        )}
        {state === 'complete' && (
           <>
            <CheckCircle size={48} className="mx-auto text-green-500 mb-4"/>
            <p className="text-white font-semibold">Your export is ready!</p>
            <p className="text-secondary text-sm mb-4">Your file should begin downloading automatically.</p>
            <Button variant="default" size="sm">Download Now</Button>
           </>
        )}
      </div>
    </Modal>
  );
};

export default ExportProgressModal;