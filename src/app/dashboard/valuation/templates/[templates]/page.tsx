'use client';

import { useState } from 'react'; // <-- 1. Import useState
import SpreadsheetInterface from '../../../../../components/features/valuation/workspace/SpreadsheetInterface';
import TemplateSidePanel from '../../../../../components/features/valuation/workspace/TemplateSidePanel';
import Link from 'next/link';
import {Button} from '../../../../../components/ui/button';
import { ArrowLeft } from 'lucide-react';
import ChartModal from '../../../../../components/features/valuation/workspace/ChartModal'; // <-- 2. Import the new modal

export default function TemplateWorkspacePage() {
  // --- THIS IS THE NEW LOGIC ---
  // 3. Add state to control the visibility of the chart modal
  const [isChartModalOpen, setIsChartModalOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col h-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
          <div className="lg:col-span-9">
            <SpreadsheetInterface />
          </div>
          <div className="lg:col-span-3">
            {/* 4. Pass down the function to open the modal */}
            <TemplateSidePanel onChartExpand={() => setIsChartModalOpen(true)} />
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Link href="/dashboard/valuation">
            <Button variant="secondary">
              <ArrowLeft size={16} className="mr-2" />
              Back to Templates
            </Button>
          </Link>
        </div>
      </div>
      
      {/* 5. Render the modal component */}
      <ChartModal 
        isOpen={isChartModalOpen}
        onClose={() => setIsChartModalOpen(false)}
      />
    </>
  );
}