import { FC } from 'react';
import Modal from '../../../ui/Modal'; // Assuming you have a reusable Modal component
import LargeInteractiveChart from './LargeInteractiveChart';
import {Button} from '../../../ui/button';
import { Download } from 'lucide-react';

interface ChartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChartModal: FC<ChartModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="DCF Analysis - Live Chart">
      <div className="flex flex-col gap-4">
        <div className="flex justify-end">
          <Button variant="secondary" size="sm">
            <Download size={16} className="mr-2" />
            Export as PNG
          </Button>
        </div>
        <div className="w-full h-[60vh]">
          <LargeInteractiveChart />
        </div>
      </div>
    </Modal>
  );
};

export default ChartModal;