'use client';

import { useState } from 'react';
import { useReportStore } from '../../../../store/reportStore';
import ReportSelectionPanel from './ReportSelectionPanel';
import FormatOptionsPanel from './FormatOptionsPanel';
import ExportSummaryPanel from './ExportSummaryPanel';
import ExportProgressModal from './ExportProgressModal';
import { ExportService, ExportResult } from '../../../../utils/exportUtils';

export type ExportFormat = 'Excel' | 'PowerPoint' | 'PDF';
export interface ExportOptions {
  includeBranding: boolean;
  customTemplate: string;
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

  const [exportState, setExportState] = useState<'idle' | 'exporting' | 'complete' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [exportResult, setExportResult] = useState<ExportResult | null>(null);
  const [error, setError] = useState<string>('');

  const handleRunExport = async () => {
  if (selectedReports.length === 0) {
    setError('Please select at least one report to export');
    return;
  }

  setExportState('exporting');
  setProgress(0);
  setError('');

  try {
    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + 5;
      });
    }, 150);

    const result = await ExportService.exportReports(selectedReports, exportFormat, options);
    
    clearInterval(progressInterval);
    setProgress(100);

    if (result.success) {
      setExportResult(result);
      setExportState('complete');
      
      // Download with slight delay to show completion
      setTimeout(() => {
        try {
          ExportService.downloadFile(result.blob, result.fileName);
        } catch (downloadError) {
          console.error('Download failed:', downloadError);
          setError('File generated but download failed. Please try again.');
          setExportState('error');
        }
      }, 1000);
    } else {
      setExportState('error');
      setError(result.error || 'Export failed. Please try again.');
    }
  } catch (err) {
    setExportState('error');
    setError(err instanceof Error ? err.message : 'Export failed. Please try again.');
  }
};

  const handleCloseModal = () => {
    setExportState('idle');
    setProgress(0);
    setExportResult(null);
    setError('');
  };

  const handleRetryExport = () => {
    setExportState('idle');
    setTimeout(() => handleRunExport(), 300);
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
            error={error}
          />
        </div>
      </div>
      
      <ExportProgressModal 
        state={exportState}
        progress={progress}
        onClose={handleCloseModal}
        onRetry={handleRetryExport}
        error={error}
        fileName={exportResult?.fileName}
      />
    </>
  );
}