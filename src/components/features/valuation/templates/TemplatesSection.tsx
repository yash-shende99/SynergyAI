'use client';

import { useState, useEffect } from 'react';
import TemplatesFilterBar from './TemplatesFilterBar';
import TemplateCard from './TemplateCard';
import { useParams } from 'next/navigation';
import { ValuationTemplate } from '../../../../types';
import { supabase } from '../../../../lib/supabaseClient'; // Adjust path to match your supabase client
import { Loader2 } from 'lucide-react';

const TemplatesSection = () => {
  const params = useParams();
  const projectId = params.projectId as string;
  const [templates, setTemplates] = useState<ValuationTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProjectTemplates = async () => {
      if (!projectId) return;
      
      setIsLoading(true);
      setError('');
      
      try {
        // Get session using your existing pattern
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log('No authentication session found, using mock data');
          setTemplates(getMockTemplates(projectId));
          setIsLoading(false);
          return;
        }

        // Use the same pattern as your reference code
        const response = await fetch(`http://localhost:8000/api/projects/${projectId}/valuation/templates`, {
          headers: { 
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setTemplates(data);
        } else {
          // If API returns error, use mock data
          const errorData = await response.json();
          console.log('API endpoint returned error, using mock data:', errorData);
          setTemplates(getMockTemplates(projectId));
        }
      } catch (error) {
        console.error('Error fetching templates, using mock data:', error);
        setError('Failed to fetch templates');
        setTemplates(getMockTemplates(projectId));
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectTemplates();
  }, [projectId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-400">
          {error} - Showing demo data
        </div>
        <TemplatesFilterBar />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {templates.map(template => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <TemplatesFilterBar />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {templates.map(template => (
          <TemplateCard key={template.id} template={template}/>
        ))}
      </div>
    </div>
  );
};

// Helper function for mock data
function getMockTemplates(projectId: string): ValuationTemplate[] {
  return [
    { 
      id: 'dcf', 
      name: 'Discounted Cash Flow (DCF)', 
      description: 'Project future cash flows and discount them to arrive at a present value estimate.', 
      lastUsed: '2 days ago', 
      thumbnailUrl: '/thumbnails/dcf.png',
      projectId 
    },
    { 
      id: 'lbo', 
      name: 'Leveraged Buyout (LBO)', 
      description: 'Model a leveraged buyout transaction to determine the potential IRR for financial sponsors.', 
      lastUsed: '1 week ago', 
      thumbnailUrl: '/thumbnails/lbo.png',
      projectId 
    },
    { 
      id: 'cca', 
      name: 'Comparable Company Analysis', 
      description: 'Value a company by comparing it to similar publicly traded companies.', 
      lastUsed: '5 days ago', 
      thumbnailUrl: '/thumbnails/comps.png',
      projectId 
    },
    { 
      id: 'pt', 
      name: 'Precedent Transactions', 
      description: 'Analyze past M&A transactions of similar companies to derive valuation multiples.', 
      lastUsed: '1 month ago', 
      thumbnailUrl: '/thumbnails/precedents.png',
      projectId 
    },
  ];
}

export default TemplatesSection;