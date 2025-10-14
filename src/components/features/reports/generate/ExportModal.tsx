// components/features/reports/generate/ExportModal.tsx
'use client';

import { FC, useState } from 'react';
import Modal from '../../../ui/Modal';
import { Button } from '../../../ui/button';
import { Download, Loader2, FileText, Presentation, File } from 'lucide-react';
import { InvestmentMemo } from '../../../../types';
import { MemoExportService, ExportOptions } from '../../../../utils/memoExportUtils';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  memo: InvestmentMemo;
}

const ExportModal: FC<ExportModalProps> = ({ isOpen, onClose, memo }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'PDF' | 'PowerPoint' | 'Word'>('PDF');
  const [includeBranding, setIncludeBranding] = useState(true);

  const handleExport = async () => {
    if (!memo) return;
    
    setIsExporting(true);
    try {
      const options: ExportOptions = {
        format: exportFormat,
        includeBranding,
        includeCharts: true
      };

      const result = await MemoExportService.exportMemo(memo, options);
      
      if (result.success) {
        MemoExportService.downloadFile(result.blob, result.fileName);
        onClose();
      } else {
        alert(`Export failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const formatOptions = [
    { value: 'PDF' as const, label: 'PDF Document', icon: FileText, description: 'Professional PDF format' },
    { value: 'PowerPoint' as const, label: 'PowerPoint', icon: Presentation, description: 'Editable presentation' },
    { value: 'Word' as const, label: 'Word Document', icon: File, description: 'Editable Word document' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Export Investment Memo" >
      <div className="space-y-6">
        <p className="text-sm text-secondary">
          Export your investment memo in a professional format suitable for presentations and reviews.
        </p>
        
        {/* Format Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-white">Export Format</label>
          <div className="grid grid-cols-1 gap-3">
            {formatOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => setExportFormat(option.value)}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    exportFormat === option.value
                      ? 'bg-primary/20 border-primary ring-2 ring-primary/50'
                      : 'bg-surface border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={20} className={
                      exportFormat === option.value ? 'text-primary' : 'text-secondary'
                    } />
                    <div className="flex-1">
                      <div className={`font-medium ${
                        exportFormat === option.value ? 'text-white' : 'text-white'
                      }`}>
                        {option.label}
                      </div>
                      <div className="text-xs text-secondary mt-1">
                        {option.description}
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      exportFormat === option.value 
                        ? 'bg-primary border-primary' 
                        : 'border-border'
                    }`} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3 pt-2">
          <label className="flex items-center gap-3 text-sm text-secondary p-2 rounded hover:bg-surface/50 cursor-pointer">
            <input
              type="checkbox"
              checked={includeBranding}
              onChange={(e) => setIncludeBranding(e.target.checked)}
              className="rounded border-border bg-background text-primary focus:ring-primary"
            />
            <div>
              <div className="text-white">Include SynergyAI branding</div>
              <div className="text-xs text-secondary mt-1">Adds professional header and footer</div>
            </div>
          </label>
        </div>

        {/* Export Button */}
        <div className="pt-4 border-t border-border">
          <Button 
            onClick={handleExport} 
            disabled={isExporting}
            variant="default" 
            size="lg" 
            className="w-full"
          >
            {isExporting ? (
              <>
                <Loader2 size={18} className="mr-2 animate-spin" />
                Exporting {exportFormat}...
              </>
            ) : (
              <>
                <Download size={18} className="mr-2" />
                Export as {exportFormat}
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ExportModal;