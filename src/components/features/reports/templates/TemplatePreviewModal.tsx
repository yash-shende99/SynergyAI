import { FC } from 'react';
import Modal from '../../../ui/Modal';
import { ReportTemplate } from '../../../../types';
import {Button} from '../../../ui/button';
import { FileText, Plus } from 'lucide-react';

interface TemplatePreviewModalProps {
  template: ReportTemplate | null;
  onClose: () => void;
  onUse: (template: ReportTemplate) => void; 
}

const TemplatePreviewModal: FC<TemplatePreviewModalProps> = ({ template, onClose, onUse }) => {
  if (!template) return null;

  return (
    <Modal isOpen={!!template} onClose={onClose} title={template.name}>
      <div className="space-y-4">
        <p className="text-sm text-secondary">{template.description}</p>
        <div>
          <h4 className="text-sm font-semibold text-white mb-2">Template Sections</h4>
          <div className="p-3 rounded-lg bg-background/50 border border-border space-y-2">
            {template.sections.map(section => (
              <div key={section} className="flex items-center gap-2 text-slate-300 text-sm">
                <FileText size={16} className="text-secondary"/>
                <span>{section}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-end pt-4 border-t border-border">
          <Button onClick={() => onUse(template)} variant="default" size="sm">
            <Plus size={16} className="mr-2"/> Use This Template
          </Button>
        </div>
      </div>
    </Modal>
  );
};
export default TemplatePreviewModal;
