'use client';

import { FC } from 'react';
import Link from 'next/link';
import { FileSpreadsheet } from 'lucide-react';
import { ValuationTemplate } from '../../../../types';

interface TemplateCardProps {
  template: ValuationTemplate;
}

const TemplateCard: FC<TemplateCardProps> = ({ template }) => {
  return (
    <Link href={`/dashboard/project/${template.projectId}/valuation/templates/${template.id}`}>
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
          <div className="px-3 py-1.5 rounded-md text-sm font-medium bg-primary text-white transition-colors group-hover:bg-primary-hover">
            Open
          </div>
        </div>
      </div>
    </Link>
  );
};

export default TemplateCard;