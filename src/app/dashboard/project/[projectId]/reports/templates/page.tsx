'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ReportTemplate } from '../../../../../../types';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '../../../../../../lib/supabaseClient';
import TemplatesSection from '../../../../../../components/features/reports/templates/TemplatesSection';
import { useReportStore } from '../../../../../../store/reportStore';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

// Fallback templates in case API fails
const fallbackTemplates: ReportTemplate[] = [
  { 
    id: 'tpl-1', 
    name: 'Standard Valuation Report', 
    category: 'Financial', 
    description: 'A comprehensive template for DCF and Comps.', 
    createdBy: 'System', 
    sections: ['Valuation Summary', 'Comparable Analysis', 'DCF Model', 'Conclusion'] 
  },
  { 
    id: 'tpl-2', 
    name: 'Full Risk Profile', 
    category: 'Risk', 
    description: 'Detailed breakdown of all identified risk categories.', 
    createdBy: 'System', 
    sections: ['Financial Risk', 'Legal Risk', 'Operational Risk', 'AI Insights'] 
  },
  { 
    id: 'tpl-3', 
    name: 'One-Page Deal Summary', 
    category: 'Strategic', 
    description: 'A concise, high-level overview for executive review.', 
    createdBy: 'Team', 
    sections: ['Executive Summary', 'Key Metrics', 'Recommendation'] 
  },
  { 
    id: 'tpl-4', 
    name: 'Final Investment Memo', 
    category: 'Investment Memo', 
    description: 'The complete, final memo for investment committee approval.', 
    createdBy: 'System', 
    sections: ['Introduction', 'Market Analysis', 'Due Diligence Findings', 'Synergy Analysis', 'Valuation', 'Recommendation'] 
  },
];

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const params = useParams();
  const projectId = params.projectId as string;
  const addDraft = useReportStore((state) => state.addDraft);
  const router = useRouter();

  const fetchTemplates = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.warn('No session found, using fallback templates');
        setTemplates(fallbackTemplates);
        return;
      }

      console.log('🔍 Fetching templates for project:', projectId);
      console.log('🔍 Using access token:', session.access_token ? 'Present' : 'Missing');

      // Use the same API URL pattern as your working component
      const apiUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:8000/api/reports/templates'
        : '/api/reports/templates';

      console.log('🔍 Calling templates API:', apiUrl);

      const response = await fetch(apiUrl, {
        headers: { 
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('🔍 Templates response status:', response.status);
      console.log('🔍 Templates response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Templates API Error:', errorText);
        throw new Error(`Failed to fetch templates: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ Templates fetched successfully:', data);
      setTemplates(data);
    } catch (err: any) {
      console.error('Error fetching templates, using fallback:', err);
      setError(err.message);
      // Use fallback templates if API fails
      setTemplates(fallbackTemplates);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleUseTemplate = async (template: ReportTemplate) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        alert("Please log in to create a draft");
        return;
      }

      console.log('🔍 Creating draft from template:', template.name);
      console.log('🔍 Using access token:', session.access_token ? 'Present' : 'Missing');

      // Use the same API URL pattern as your working component
      const apiUrl = process.env.NODE_ENV === 'development' 
        ? `http://localhost:8000/api/projects/${projectId}/drafts`
        : `/api/projects/${projectId}/drafts`;

      console.log('🔍 Calling create draft API:', apiUrl);

      let newDraft;
      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${session.access_token}` 
          },
          body: JSON.stringify({ 
            template_id: template.id, 
            template_name: template.name 
          })
        });
        
        console.log('🔍 Create draft response status:', response.status);
        console.log('🔍 Create draft response ok:', response.ok);

        if (response.ok) {
          newDraft = await response.json();
          console.log('✅ Draft created successfully:', newDraft);
        } else {
          const errorText = await response.text();
          console.error('❌ Create draft API Error:', errorText);
          throw new Error(`Failed to create draft: ${response.status} ${response.statusText}`);
        }
      } catch (apiError) {
        console.warn('Backend API failed, creating draft locally:', apiError);
        // Create draft locally if backend fails
        newDraft = {
          id: `draft-${Date.now()}`,
          title: template.name,
          status: 'Draft',
          project_id: projectId,
          created_at: new Date().toISOString(),
          last_modified: new Date().toISOString(),
          content: {
            template_id: template.id,
            sections: template.sections,
            content: {
              executiveSummary: `This is a new draft based on the ${template.name} template.`
            }
          }
        };
      }
      
      // Add to local store with proper structure
      addDraft({
        title: newDraft.title || template.name,
        createdBy: { 
          name: 'You', 
          avatarUrl: '' 
        },
        status: 'Draft',
        projectId: projectId
      });
      
      console.log('✅ Draft added to store, navigating to reports...');
      
      // Navigate to drafts page
      router.push(`/dashboard/project/${projectId}/reports`);
      
    } catch (error: any) {
      console.error('❌ Error creating draft:', error);
      alert(`Error: ${error.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary"/>
        <span className="ml-2 text-white">Loading templates...</span>
      </div>
    );
  }

  if (error && templates.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Error Loading Templates</h3>
          <p className="text-secondary mb-4">{error}</p>
          <div className="flex gap-2 justify-center">
            <Button 
              onClick={fetchTemplates} 
              variant="default"
            >
              <RefreshCw size={16} className="mr-2"/>
              Try Again
            </Button>
            <Button 
              onClick={() => setTemplates(fallbackTemplates)} 
              variant="secondary"
            >
              Use Offline Templates
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-4 p-4 bg-amber-500/20 border border-amber-500/50 rounded-lg">
          <div className="flex items-center gap-2 text-amber-300">
            <AlertCircle size={16} />
            <span className="text-sm">Using offline templates: {error}</span>
          </div>
        </div>
      )}
      <TemplatesSection 
        templates={templates} 
        onUseTemplate={handleUseTemplate} 
      />
    </div>
  );
}