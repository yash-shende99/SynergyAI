import { FC } from 'react';
import Modal from '../../../ui/Modal';
import { Alert } from '../../../../types';
import { Bot, Link as LinkIcon, Building, UserCheck } from 'lucide-react';
import {Button} from '../../../ui/button';

interface AlertDetailsModalProps {
  alert: Alert | null;
  onClose: () => void;
}

const AlertDetailsModal: FC<AlertDetailsModalProps> = ({ alert, onClose }) => {
  if (!alert) return null;

  return (
    <Modal isOpen={!!alert} onClose={onClose} title={alert.title}>
      <div className="space-y-6">
        {/* Full Description */}
        <div>
          <h4 className="text-sm font-semibold text-secondary mb-1">Full Description</h4>
          <p className="text-slate-300 text-sm">{alert.description}</p>
        </div>

        {/* Related Entities */}
        <div>
          <h4 className="text-sm font-semibold text-secondary mb-2">Related Entities</h4>
          <div className="flex flex-wrap gap-2">
            <span className="flex items-center gap-2 px-2 py-1 bg-surface rounded text-xs"><Building size={14}/> SolarTech Inc.</span>
            <span className="flex items-center gap-2 px-2 py-1 bg-surface rounded text-xs"><UserCheck size={14}/> Ananya Sharma (Deal Lead)</span>
          </div>
        </div>

        {/* Source Links */}
         <div>
          <h4 className="text-sm font-semibold text-secondary mb-2">Source</h4>
          <a href="#" className="flex items-center gap-2 text-sm text-primary hover:underline">
            <LinkIcon size={14} /> 
            View MCA Filing Document
          </a>
        </div>
        
        {/* AI Insight */}
        <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
          <div className="flex items-center gap-2 mb-2">
            <Bot size={16} className="text-primary"/>
            <h4 className="text-sm font-bold text-white">Suggested AI Insight</h4>
          </div>
          <p className="text-sm text-blue-200">{alert.aiInsight}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
            <Button variant="secondary" size="sm">Mark as Read</Button>
            <Button variant="secondary" size="sm">Flag for Review</Button>
            <Button variant="default" size="sm">Assign to Team Member</Button>
        </div>
      </div>
    </Modal>
  );
};

export default AlertDetailsModal;