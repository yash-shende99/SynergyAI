'use client'; // This component now uses client-side hooks

import TemplatesFilterBar from './TemplatesFilterBar';
import TemplateCard from './TemplateCard';
import Link from 'next/link'; // <-- 1. Import the Link component

// 2. Add an 'id' to our mock data for creating unique URLs
const mockTemplates = [
  { id: 'dcf', name: 'Discounted Cash Flow (DCF)', description: 'Project future cash flows and discount them to arrive at a present value estimate.', lastUsed: '2 days ago', thumbnailUrl: '/thumbnails/dcf.png' },
  { id: 'lbo', name: 'Leveraged Buyout (LBO)', description: 'Model a leveraged buyout transaction to determine the potential IRR for financial sponsors.', lastUsed: '1 week ago', thumbnailUrl: '/thumbnails/lbo.png' },
  { id: 'cca', name: 'Comparable Company Analysis', description: 'Value a company by comparing it to similar publicly traded companies.', lastUsed: '5 days ago', thumbnailUrl: '/thumbnails/comps.png' },
  { id: 'pt', name: 'Precedent Transactions', description: 'Analyze past M&A transactions of similar companies to derive valuation multiples.', lastUsed: '1 month ago', thumbnailUrl: '/thumbnails/precedents.png' },
];

const TemplatesSection = () => {
  return (
    <div className="space-y-6">
      <TemplatesFilterBar />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {mockTemplates.map(template => (
          // --- THIS IS THE FIX ---
          // 3. Wrap the entire TemplateCard in a Link component.
          //    This makes the whole card a clickable navigation element.
          <Link 
            href={`/dashboard/valuation/templates/${template.id}`} 
            key={template.id}
          >
            <TemplateCard template={template} />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TemplatesSection;