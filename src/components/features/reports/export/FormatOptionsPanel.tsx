import { FC } from 'react';
import { ExportFormat, ExportOptions } from './ExportSection';
import { File, Image as ImageIcon, Link2, FileText, Table, Presentation } from 'lucide-react';

interface FormatOptionsPanelProps {
  exportFormat: ExportFormat;
  setExportFormat: (format: ExportFormat) => void;
  options: ExportOptions;
  setOptions: (options: ExportOptions) => void;
}

const FormatOptionsPanel: FC<FormatOptionsPanelProps> = ({ exportFormat, setExportFormat, options, setOptions }) => {
  const formats = [
  { 
    value: 'PDF' as ExportFormat, 
    label: 'PDF Document', 
    icon: FileText, 
    description: 'Professional PDF with proper formatting' 
  },
  { 
    value: 'Excel' as ExportFormat, 
    label: 'Excel (CSV)', 
    icon: Table, 
    description: 'Spreadsheet data for analysis' 
  },
  { 
    value: 'PowerPoint' as ExportFormat, 
    label: 'PowerPoint', 
    icon: Presentation, 
    description: 'Presentation slides outline' 
  },
];

  const templates = [
    { value: 'None', label: 'No Template' },
    { value: 'Valuation', label: 'Valuation Template' },
    { value: 'Risk', label: 'Risk Report Template' },
    { value: 'Executive', label: 'Executive Summary Template' },
  ];

  const handleTemplateChange = (template: string) => {
    setOptions({ ...options, customTemplate: template });
  };

  return (
    <div className="p-6 rounded-xl border border-border bg-surface/50">
      <h3 className="font-bold text-white text-lg mb-4">Step 2: Choose Export Format</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {formats.map(({ value, label, icon: Icon, description }) => (
          <button 
            key={value} 
            onClick={() => setExportFormat(value)} 
            className={`p-4 rounded-lg border text-left transition-all ${
              exportFormat === value 
                ? 'bg-primary/20 border-primary text-white shadow-lg shadow-primary/20' 
                : 'bg-surface border-border text-secondary hover:border-primary hover:bg-surface/80'
            }`}
          >
            <Icon size={24} className="mb-2" />
            <div className="font-semibold text-sm mb-1">{label}</div>
            <div className="text-xs opacity-70">{description}</div>
          </button>
        ))}
      </div>

      <h3 className="font-bold text-white text-lg mb-4 mt-6">Step 3: Export Options</h3>
      <div className="space-y-3 bg-background/30 rounded-lg p-4 border border-border/50">
        <label className="flex items-center gap-3 p-2 rounded text-slate-300 hover:bg-surface/30 cursor-pointer">
          <input 
            type="checkbox" 
            checked={options.includeBranding} 
            onChange={e => setOptions({...options, includeBranding: e.target.checked})} 
            className="h-4 w-4 rounded bg-surface border-border text-primary focus:ring-primary"
          />
          <ImageIcon size={16} className="text-secondary"/>
          <div>
            <div className="text-sm font-medium">Include Company Branding</div>
            <div className="text-xs text-secondary">Adds SynergyAI logo and headers</div>
          </div>
        </label>
        
        <label className="flex items-center gap-3 p-2 rounded text-slate-300 hover:bg-surface/30 cursor-pointer">
          <input 
            type="checkbox" 
            checked={options.includeSources} 
            onChange={e => setOptions({...options, includeSources: e.target.checked})} 
            className="h-4 w-4 rounded bg-surface border-border text-primary focus:ring-primary"
          />
          <Link2 size={16} className="text-secondary"/>
          <div>
            <div className="text-sm font-medium">Include Document Sources</div>
            <div className="text-xs text-secondary">Adds references to original VDR documents</div>
          </div>
        </label>
        
        <div className="flex items-start gap-3 p-2">
          <File size={16} className="text-secondary mt-1 flex-shrink-0"/>
          <div className="flex-1">
            <div className="text-sm font-medium text-slate-300 mb-1">Apply Template</div>
            <select 
              value={options.customTemplate}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-white"
            >
              {templates.map(template => (
                <option key={template.value} value={template.value}>
                  {template.label}
                </option>
              ))}
            </select>
            <div className="text-xs text-secondary mt-1">
              Applies predefined formatting and structure
            </div>
          </div>
        </div>
      </div>

      {/* File Format Info */}
      <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <div className="text-sm text-blue-300">
          <strong>Note:</strong> { 
            exportFormat === 'PDF' ? 'PDF exports create formatted text documents optimized for printing.' :
            exportFormat === 'Excel' ? 'Excel exports create CSV files compatible with spreadsheet applications.' :
            'PowerPoint exports create text outlines that can be imported into presentation software.'
          }
        </div>
      </div>
    </div>
  );
};

export default FormatOptionsPanel;