import { FC } from 'react';
import Modal from '../../../ui/Modal';
import { Alert } from '../../../../types';
import { Bot } from 'lucide-react';
import {Button} from '../../../ui/button';

const AlertDetailsModal: FC<{ alert: Alert | null, onClose: () => void }> = ({ alert, onClose }) => {
  if (!alert) return null;
  return (
    <Modal isOpen={!!alert} onClose={onClose} title={alert.title}>
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-semibold text-secondary mb-1">Full Description</h4>
          <p className="text-slate-300 text-sm">{alert.description}</p>
        </div>
        <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
          <div className="flex items-center gap-2 mb-2"><Bot size={16} className="text-primary"/><h4 className="text-sm font-bold text-white">Suggested AI Insight</h4></div>
          <p className="text-sm text-blue-200">{alert.aiInsight}</p>
        </div>
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
            <Button variant="secondary" size="sm">Mark as Read</Button>
            <Button variant="default" size="sm">Assign to Team</Button>
        </div>
      </div>
    </Modal>
  );
};
export default AlertDetailsModal;