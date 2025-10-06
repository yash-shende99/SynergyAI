// components/features/vdr/annotations/DocumentListPanel.tsx
import { FC } from 'react';
import { AnnotatedDocument } from '../../../../types';
import { FileText, MessageSquare, AlertCircle, Upload } from 'lucide-react';

interface DocumentListPanelProps {
  documents: AnnotatedDocument[];
  activeDocument: AnnotatedDocument | null;
  onSelectDocument: (doc: AnnotatedDocument) => void;
}

const DocumentListPanel: FC<DocumentListPanelProps> = ({ 
  documents, 
  activeDocument, 
  onSelectDocument 
}) => {
  console.log('📄 Documents in DocumentListPanel:', documents); // Debug log

  return (
    <div className="p-4 rounded-xl border border-border bg-surface/50 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white">Project Documents</h3>
        <span className="text-xs text-secondary bg-surface px-2 py-1 rounded">
          {documents.length} docs
        </span>
      </div>
      
      {documents.length === 0 ? (
        <div className="text-center text-secondary py-8">
          <Upload size={48} className="mx-auto mb-4 opacity-50" />
          <p className="font-medium mb-2">No documents uploaded yet</p>
          <p className="text-sm mb-4">Upload documents to the VDR to start annotating</p>
        </div>
      ) : (
        <div className="space-y-2">
          {documents.map(doc => {
            console.log('📋 Document data:', doc); // Debug each document
            const commentCount = doc.comment_count || 0;
            const unresolvedCount = doc.unresolved_count || 0;
            
            return (
              <button 
                key={doc.id} 
                onClick={() => onSelectDocument(doc)}
                className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                  activeDocument?.id === doc.id ? 'bg-surface' : 'hover:bg-surface/50'
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden flex-1 min-w-0">
                  <FileText size={16} className="text-secondary flex-shrink-0" />
                  <div className="overflow-hidden flex-1 min-w-0">
                    <span className="font-medium text-white truncate text-sm block">
                      {doc.name}
                    </span>
                    {commentCount === 0 && (
                      <span className="text-xs text-secondary">No annotations yet</span>
                    )}
                  </div>
                </div>
                
                {/* Annotation Counts */}
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  {unresolvedCount > 0 && (
                    <div className="flex items-center gap-1 text-amber-400" title={`${unresolvedCount} unresolved`}>
                      <AlertCircle size={12} />
                      <span className="text-xs font-semibold">{unresolvedCount}</span>
                    </div>
                  )}
                  {commentCount > 0 && (
                    <div className="flex items-center gap-1 text-primary" title={`${commentCount} total annotations`}>
                      <span className="text-xs font-semibold">{commentCount}</span>
                      <MessageSquare size={14} />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DocumentListPanel;