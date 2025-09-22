import { FC } from 'react';
import { FileText, MessageSquare } from 'lucide-react';

const mockDocsWithComments = [
  { name: 'Master Service Agreement.docx', commentCount: 3 },
  { name: 'FY2024 Audited Financials.pdf', commentCount: 1 },
  { name: 'Employee Handbook.pdf', commentCount: 0 },
];

interface DocumentListPanelProps {
  activeDocument: string;
  onSelectDocument: (docName: string) => void;
}

const DocumentListPanel: FC<DocumentListPanelProps> = ({ activeDocument, onSelectDocument }) => {
  return (
    <div className="p-4 rounded-xl border border-border bg-surface/50 h-full">
      <h3 className="font-semibold text-white mb-4">Documents with Comments</h3>
      <div className="space-y-2">
        {mockDocsWithComments.map(doc => (
          <button
            key={doc.name}
            onClick={() => onSelectDocument(doc.name)}
            className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors ${
              activeDocument === doc.name ? 'bg-surface' : 'hover:bg-surface/50'
            }`}
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <FileText size={16} className="text-secondary flex-shrink-0"/>
              <span className="font-medium text-white truncate text-sm">{doc.name}</span>
            </div>
            {doc.commentCount > 0 && (
              <div className="flex items-center gap-1 text-xs text-primary font-semibold">
                <span>{doc.commentCount}</span>
                <MessageSquare size={14}/>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DocumentListPanel;