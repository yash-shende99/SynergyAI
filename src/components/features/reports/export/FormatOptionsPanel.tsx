import { FC } from 'react';
import { ExportFormat, ExportOptions } from './ExportSection';
import { File, Image as ImageIcon, Link2 } from 'lucide-react';

interface FormatOptionsPanelProps {
  exportFormat: ExportFormat;
  setExportFormat: (format: ExportFormat) => void;
  options: ExportOptions;
  setOptions: (options: ExportOptions) => void;
}

const FormatOptionsPanel: FC<FormatOptionsPanelProps> = ({ exportFormat, setExportFormat, options, setOptions }) => {
  const formats: ExportFormat[] = ['PDF', 'PowerPoint', 'Excel'];
  return (
    <div className="p-6 rounded-xl border border-border bg-surface/50">
      <h3 className="font-bold text-white text-lg mb-4">Step 2: Choose Export Format</h3>
      <div className="flex gap-4">
        {formats.map(format => (
          <button key={format} onClick={() => setExportFormat(format)} className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${exportFormat === format ? 'bg-primary border-primary text-white' : 'bg-surface border-border text-secondary hover:border-primary'}`}>
            {format}
          </button>
        ))}
      </div>

      <h3 className="font-bold text-white text-lg mb-4 mt-6">Step 3: Options</h3>
      <div className="space-y-2">
        <label className="flex items-center gap-3 p-2 rounded text-slate-300">
            <input type="checkbox" checked={options.includeBranding} onChange={e => setOptions({...options, includeBranding: e.target.checked})} className="h-4 w-4 rounded bg-surface border-border text-primary"/>
            <ImageIcon size={16} className="text-secondary"/><span>Include Company Logo / Branding</span>
        </label>
        <label className="flex items-center gap-3 p-2 rounded text-slate-300">
            <input type="checkbox" checked={options.includeSources} onChange={e => setOptions({...options, includeSources: e.target.checked})} className="h-4 w-4 rounded bg-surface border-border text-primary"/>
            <Link2 size={16} className="text-secondary"/><span>Include Sources (links back to VDR docs)</span>
        </label>
        <div className="flex items-center gap-3 p-2">
           <File size={16} className="text-secondary"/>
           <span className="text-slate-300">Apply Custom Template</span>
           <select className="bg-background border border-border rounded-md px-2 py-1 text-sm text-secondary">
               <option>None</option><option>Valuation Template</option><option>Risk Report Template</option>
           </select>
        </div>
      </div>
    </div>
  );
};

export default FormatOptionsPanel;