import { FC } from 'react';
import { BookOpen, Link as LinkIcon } from 'lucide-react';
import LivePreviewChart from './LivePreviewChart';

interface TemplateSidePanelProps {
  onChartExpand: () => void;
}

const TemplateSidePanel : FC<TemplateSidePanelProps> = ({ onChartExpand }) => {
  return (
    <div className="space-y-6">
        <LivePreviewChart onExpand={onChartExpand} />
        <div className="p-4 rounded-xl border border-border bg-surface/50 h-full">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen size={16} className="text-secondary"/>
            <h4 className="font-semibold text-white text-sm">Instructions & Notes</h4>
          </div>
          <p className="text-xs text-secondary">
            Enter historical data and future projections in the editable fields. Formulas will update automatically. Use the quick links below to auto-populate data from your VDR.
          </p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-surface/50 h-full">
          <div className="flex items-center gap-2 mb-2">
            <LinkIcon size={16} className="text-secondary"/>
            <h4 className="font-semibold text-white text-sm">Quick Links</h4>
          </div>
          <div className="space-y-1">
              <button className="w-full text-left text-primary hover:underline text-xs">→ Auto-populate from FY24 Financials.pdf</button>
              <button className="w-full text-left text-primary hover:underline text-xs">→ Link to Deal Sourcing Data</button>
          </div>
        </div>
    </div>
  );
};

export default TemplateSidePanel;