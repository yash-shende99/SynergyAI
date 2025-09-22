import { FC } from 'react';
import { Draft } from '../../../../types';
import { ExportFormat, ExportOptions } from './ExportSection';
import {Button} from '../../../ui/button';
import { Download } from 'lucide-react';

interface ExportSummaryPanelProps {
  selectedReports: Draft[];
  format: ExportFormat;
  options: ExportOptions;
  onExport: () => void;
}

const ExportSummaryPanel: FC<ExportSummaryPanelProps> = ({ selectedReports, format, options, onExport }) => {
  return (
    <div className="p-6 rounded-xl border border-border bg-surface/50 h-full sticky top-6">
      <h3 className="font-bold text-white text-lg mb-4">Export Summary</h3>
      <div className="space-y-3 text-sm">
        <div>
          <p className="text-xs text-secondary font-semibold">Reports Selected:</p>
          <p className="font-medium text-white">{selectedReports.length} Document{selectedReports.length !== 1 ? 's' : ''}</p>
        </div>
        <div>
          <p className="text-xs text-secondary font-semibold">Format:</p>
          <p className="font-medium text-white">{format}</p>
        </div>
        <div>
          <p className="text-xs text-secondary font-semibold">Options:</p>
          <ul className="list-disc list-inside text-slate-300">
              {options.includeBranding && <li>Branding Included</li>}
              {options.includeSources && <li>Sources Included</li>}
              <li>Template: {options.customTemplate}</li>
          </ul>
        </div>
      </div>
      <div className="mt-6 pt-4 border-t border-border">
          <Button onClick={onExport} variant="default" size="default" className="w-full" disabled={selectedReports.length === 0}>
            <Download size={16} className="mr-2"/>
            Export ({selectedReports.length})
          </Button>
          <Button variant="ghost" size="sm" className="w-full mt-2">Cancel</Button>
      </div>
    </div>
  );
};

export default ExportSummaryPanel;