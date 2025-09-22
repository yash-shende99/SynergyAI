'use client';

import { useState } from 'react';
import { ReportTemplate, Draft  } from '../../../../types';
import TemplatesHeader from './TemplatesHeader';
import TemplateCard from './TemplateCard';
import TemplatePreviewModal from './TemplatePreviewModal';
import TemplatesFooter from './TemplatesFooter';
import { useReportStore } from '../../../../store/reportStore'; // <-- 1. Import the store
import { useRouter } from 'next/navigation'; // <-- 2. Import the router

// Mock data for the template gallery
const mockTemplates: ReportTemplate[] = [
  { id: 'tpl-1', name: 'Standard Valuation Report', category: 'Financial', description: 'A comprehensive template for DCF and Comps.', createdBy: 'System', sections: ['Valuation Summary', 'Comparable Analysis', 'DCF Model', 'Conclusion'] },
  { id: 'tpl-2', name: 'Full Risk Profile', category: 'Risk', description: 'Detailed breakdown of all identified risk categories.', createdBy: 'System', sections: ['Financial Risk', 'Legal Risk', 'Operational Risk', 'AI Insights'] },
  { id: 'tpl-3', name: 'One-Page Deal Summary', category: 'Strategic', description: 'A concise, high-level overview for executive review.', createdBy: 'Team', sections: ['Executive Summary', 'Key Metrics', 'Recommendation'] },
  { id: 'tpl-4', name: 'Final Investment Memo', category: 'Investment Memo', description: 'The complete, final memo for investment committee approval.', createdBy: 'System', sections: ['Introduction', 'Market Analysis', 'Due Diligence Findings', 'Synergy Analysis', 'Valuation', 'Recommendation'] },
];

export default function TemplatesSection() {
  const [previewingTemplate, setPreviewingTemplate] = useState<ReportTemplate | null>(null);
  const addDraft = useReportStore((state) => state.addDraft); // <-- 3. Get the addDraft action
  const router = useRouter(); // <-- 4. Initialize the router

  // --- THIS IS THE NEW, FUNCTIONAL HANDLER ---
  const handleUseTemplate = (template: ReportTemplate) => {
    // 5. Create a new draft object from the template
    const newDraft: Draft = {
      id: `draft-${Date.now()}`,
      title: template.name,
      createdBy: { name: 'Yash Shende', avatarUrl: '...' }, // Assuming current user
      lastModified: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric'}),
      status: 'Draft',
    };

    // 6. Add the new draft to our global store
    addDraft(newDraft);
    
    // 7. Close the modal and navigate the user to the Drafts page
    setPreviewingTemplate(null);
    router.push('/dashboard/reports');
  };

  return (
    <>
      <div className="space-y-6">
        <TemplatesHeader />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mockTemplates.map(template => (
            <TemplateCard 
              key={template.id} 
              template={template} 
              onPreview={() => setPreviewingTemplate(template)}
              onUse={() => handleUseTemplate(template)}
            />
          ))}
        </div>
        <TemplatesFooter />
      </div>
      <TemplatePreviewModal 
        template={previewingTemplate}
        onClose={() => setPreviewingTemplate(null)}
        onUse={handleUseTemplate}
      />
    </>
  );
}