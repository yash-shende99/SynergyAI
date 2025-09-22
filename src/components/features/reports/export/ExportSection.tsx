'use client';

import { useState } from 'react';
import { useReportStore } from '../../../../store/reportStore';
import ReportSelectionPanel from './ReportSelectionPanel';
import FormatOptionsPanel from './FormatOptionsPanel';
import ExportSummaryPanel from './ExportSummaryPanel';
import ExportProgressModal from './ExportProgressModal';

export type ExportFormat = 'Excel' | 'PowerPoint' | 'PDF';
export interface ExportOptions {
  includeBranding: boolean;
  customTemplate: string; // e.g., 'Valuation' or 'None'
  includeSources: boolean;
}

export default function ExportSection() {
  const allDrafts = useReportStore((state) => state.drafts);
  const [selectedReportIds, setSelectedReportIds] = useState<string[]>([]);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('PDF');
  const [options, setOptions] = useState<ExportOptions>({
    includeBranding: true,
    customTemplate: 'None',
    includeSources: false,
  });

  const [exportState, setExportState] = useState<'idle' | 'exporting' | 'complete'>('idle');
  const [progress, setProgress] = useState(0);

  const handleRunExport = () => {
    setExportState('exporting');
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setExportState('complete');
          return 100;
        }
        return prev + 5;
      });
    }, 150);
  };

  const handleCloseModal = () => {
    setExportState('idle');
  };

  const selectedReports = allDrafts.filter(d => selectedReportIds.includes(d.id));

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel: The step-by-step wizard */}
        <div className="lg:col-span-2 space-y-6">
          <ReportSelectionPanel 
            drafts={allDrafts}
            selectedReportIds={selectedReportIds}
            setSelectedReportIds={setSelectedReportIds}
          />
          <FormatOptionsPanel 
            exportFormat={exportFormat}
            setExportFormat={setExportFormat}
            options={options}
            setOptions={setOptions}
          />
        </div>

        {/* Right Panel: The dynamic summary */}
        <div className="lg:col-span-1">
          <ExportSummaryPanel
            selectedReports={selectedReports}
            format={exportFormat}
            options={options}
            onExport={handleRunExport}
          />
        </div>
      </div>
      
      <ExportProgressModal 
        state={exportState}
        progress={progress}
        onClose={handleCloseModal}
      />
    </>
  );
}