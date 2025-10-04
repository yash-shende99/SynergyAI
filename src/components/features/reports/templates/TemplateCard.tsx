import { FC } from 'react';
import { ReportTemplate, TemplateCategory } from '../../../../types';
import {Button} from '../../../ui/button';
import { Eye, Plus, FileSpreadsheet } from 'lucide-react';

const categoryColors: Record<TemplateCategory, string> = {
  Financial: 'bg-blue-500/30 text-blue-300',
  Risk: 'bg-red-500/30 text-red-300',
  Strategic: 'bg-purple-500/30 text-purple-300',
  'Investment Memo': 'bg-green-500/30 text-green-300',
  Legal: 'bg-amber-500/30 text-amber-300',
};

interface TemplateCardProps {
  template: ReportTemplate;
  onPreview: () => void;
  onUse: (template: ReportTemplate) => void;
}

const TemplateCard: FC<TemplateCardProps> = ({ template, onPreview, onUse }) => {
  return (
    <div className="rounded-2xl border border-border bg-surface/50 p-6 flex flex-col group">
      <div className="w-full h-32 bg-background/50 rounded-lg flex items-center justify-center border border-border mb-4">
        <FileSpreadsheet size={48} className="text-secondary opacity-50"/>
      </div>
      <div className="flex-1">
        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${categoryColors[template.category]}`}>{template.category}</span>
        <h3 className="text-lg font-bold text-white mt-2">{template.name}</h3>
        <p className="text-sm text-secondary mt-1 h-10">{template.description}</p>
      </div>
      <div className="mt-4 pt-4 border-t border-border/50 flex justify-between items-center">
        <span className="text-xs text-secondary">By: {template.createdBy}</span>
        <div className="flex items-center gap-2">
            <Button onClick={onPreview} variant="secondary" size="sm"><Eye size={14} className="mr-1.5"/>Preview</Button>
            <Button onClick={() => onUse(template)} variant="default" size="sm"><Plus size={14} className="mr-1.5"/>Use</Button>
        </div>
      </div>
    </div>
  );
};
export default TemplateCard;
