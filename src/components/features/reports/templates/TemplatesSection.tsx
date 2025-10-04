'use client';

import { useState } from 'react';
import { ReportTemplate } from '../../../../types';
import TemplatesHeader from './TemplatesHeader';
import TemplateCard from './TemplateCard';
import TemplatePreviewModal from './TemplatePreviewModal';
import TemplatesFooter from './TemplatesFooter';

interface TemplatesSectionProps {
  templates: ReportTemplate[];
  onUseTemplate: (template: ReportTemplate) => void;
}

const TemplatesSection: React.FC<TemplatesSectionProps> = ({ templates, onUseTemplate }) => {
  const [previewingTemplate, setPreviewingTemplate] = useState<ReportTemplate | null>(null);
  
  return (
    <>
      <div className="space-y-6">
        <TemplatesHeader />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {templates.map(template => (
            <TemplateCard 
              key={template.id} 
              template={template} 
              onPreview={() => setPreviewingTemplate(template)}
              onUse={() => onUseTemplate(template)}
            />
          ))}
        </div>
        <TemplatesFooter />
      </div>
      <TemplatePreviewModal 
        template={previewingTemplate}
        onClose={() => setPreviewingTemplate(null)}
        onUse={onUseTemplate}
      />
    </>
  );
};
export default TemplatesSection;
