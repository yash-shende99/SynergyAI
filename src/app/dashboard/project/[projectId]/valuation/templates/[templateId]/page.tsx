'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import SpreadsheetInterface from '../../../../../../../components/features/valuation/workspace/SpreadsheetInterface';
import TemplateSidePanel from '../../../../../../../components/features/valuation/workspace/TemplateSidePanel';
import Link from 'next/link';
import { Button } from '../../../../../../../components/ui/button';
import { ArrowLeft } from 'lucide-react';
import ChartModal from '../../../../../../../components/features/valuation/workspace/ChartModal';
import { Loader2 } from 'lucide-react';

export default function TemplateWorkspacePage() {
  const [isChartModalOpen, setIsChartModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams();
  const projectId = params.projectId as string;
  const templateId = params.templateId as string;

  useEffect(() => {
    // Simulate loading template data
    const loadTemplate = async () => {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
      setIsLoading(false);
    };
    
    loadTemplate();
  }, [projectId, templateId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
          <div className="lg:col-span-9">
            <SpreadsheetInterface />
          </div>
          <div className="lg:col-span-3">
            <TemplateSidePanel onChartExpand={() => setIsChartModalOpen(true)} />
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Link href={`/dashboard/projects/${projectId}/valuation`}>
            <Button variant="secondary">
              <ArrowLeft size={16} className="mr-2" />
              Back to Templates
            </Button>
          </Link>
        </div>
      </div>
      
      <ChartModal 
        isOpen={isChartModalOpen}
        onClose={() => setIsChartModalOpen(false)}
      />
    </>
  );
}