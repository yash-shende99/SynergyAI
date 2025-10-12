import { FC } from 'react';
import { Draft } from '../../../../types';
import { ExportFormat, ExportOptions } from './ExportSection';
import { Button } from '../../../ui/button';
import { Download, AlertCircle } from 'lucide-react';

interface ExportSummaryPanelProps {
  selectedReports: Draft[];
  format: ExportFormat;
  options: ExportOptions;
  onExport: () => void;
  error?: string;
}

const ExportSummaryPanel: FC<ExportSummaryPanelProps> = ({ 
  selectedReports, 
  format, 
  options, 
  onExport,
  error 
}) => {
  return (
    <div className="p-6 rounded-xl border border-border bg-surface/50 h-full sticky top-6">
      <h3 className="font-bold text-white text-lg mb-4">Export Summary</h3>
      
      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        </div>
      )}

      <div className="space-y-3 text-sm">
        <div>
          <p className="text-xs text-secondary font-semibold">Reports Selected:</p>
          <p className="font-medium text-white">
            {selectedReports.length} Document{selectedReports.length !== 1 ? 's' : ''}
          </p>
          {selectedReports.length > 0 && (
            <div className="mt-1 max-h-32 overflow-y-auto">
              {selectedReports.map(report => (
                <div key={report.id} className="text-xs text-slate-400 truncate">
                  • {report.title}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div>
          <p className="text-xs text-secondary font-semibold">Format:</p>
          <p className="font-medium text-white">{format}</p>
        </div>
        
        <div>
          <p className="text-xs text-secondary font-semibold">Options:</p>
          <ul className="list-disc list-inside text-slate-300 text-xs">
            {options.includeBranding && <li>Branding Included</li>}
            {options.includeSources && <li>Sources Included</li>}
            <li>Template: {options.customTemplate}</li>
          </ul>
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-border">
        <Button 
          onClick={onExport} 
          variant="default" 
          size="default" 
          className="w-full" 
          disabled={selectedReports.length === 0}
        >
          <Download size={16} className="mr-2"/>
          Export ({selectedReports.length})
        </Button>
        
        <div className="text-xs text-secondary text-center mt-2">
          {selectedReports.length === 0 ? 'Select reports to enable export' : 'Ready to export'}
        </div>
      </div>
    </div>
  );
};

export default ExportSummaryPanel;