import { FC } from 'react';
import {Button} from '../../../ui/button';
import { FileSpreadsheet } from 'lucide-react';

interface Template {
  name: string;
  description: string;
  lastUsed: string;
  thumbnailUrl: string; // Placeholder for now
}

interface TemplateCardProps {
  template: Template;
}

const TemplateCard: FC<TemplateCardProps> = ({ template }) => {
  return (
    // The parent <Link> makes this whole div clickable.
    // The group class allows us to add hover effects to child elements.
    <div className="group rounded-2xl border border-border bg-surface/50 p-6 flex flex-col h-full transition-all duration-300 hover:border-primary/50 hover:bg-surface/80 hover:shadow-2xl hover:shadow-primary/10">
      <div className="w-full h-32 bg-background/50 rounded-lg flex items-center justify-center border border-border mb-4">
        <FileSpreadsheet size={48} className="text-secondary opacity-50"/>
      </div>

      <div className="flex-1">
        <h3 className="text-lg font-bold text-white">{template.name}</h3>
        <p className="text-sm text-secondary mt-1 h-16">{template.description}</p>
      </div>

      <div className="mt-4 pt-4 border-t border-border/50 flex justify-between items-center">
        <div>
          <p className="text-xs text-secondary">Last used</p>
          <p className="text-xs font-semibold text-white">{template.lastUsed}</p>
        </div>
        {/* This button is now just a visual cue. The Link handles the click. */}
        <div className="px-3 py-1.5 rounded-md text-sm font-medium bg-primary text-white transition-colors group-hover:bg-primary-hover">
          Open
        </div>
      </div>
    </div>
  );
};

export default TemplateCard;