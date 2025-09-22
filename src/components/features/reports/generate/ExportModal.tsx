import { FC } from 'react';
import Modal from '../../../ui/Modal';
import {Button} from '../../../ui/button';
import { Download } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ExportModal: FC<ExportModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Export Investment Memo">
      <div className="space-y-4">
          <p className="text-sm text-secondary">Select your desired format and options. Exported versions will automatically include detailed charts and visualizations from their respective modules.</p>
          <div className="flex gap-4">
            <button className="px-4 py-2 rounded-lg border text-sm font-medium bg-primary border-primary text-white">PDF</button>
            <button className="px-4 py-2 rounded-lg border text-sm font-medium bg-surface border-border text-secondary">PowerPoint</button>
            <button className="px-4 py-2 rounded-lg border text-sm font-medium bg-surface border-border text-secondary">Word</button>
          </div>
          <div className="pt-4 border-t border-border">
            <Button variant="default" size="sm" className="w-full"><Download size={16} className="mr-2"/>Export Now</Button>
          </div>
      </div>
    </Modal>
  );
};
export default ExportModal;