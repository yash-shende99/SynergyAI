'use client';

import { FC, useState } from 'react';
import { FileText, MoreVertical, Download, Trash2 } from 'lucide-react';
import { Document } from '../../../../types';

interface DocumentListProps {
  documents: Document[];
  selectedDocument: Document | null;
  onSelectDocument: (doc: Document) => void;
  onDeleteDocument: (docId: string) => void;
  onDownloadDocument: (doc: Document) => void;
}

const DocumentList: FC<DocumentListProps> = ({
  documents,
  selectedDocument,
  onSelectDocument,
  onDeleteDocument,
  onDownloadDocument
}) => {
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const handleMenuClick = (e: React.MouseEvent, docId: string) => {
    e.stopPropagation();
    setMenuOpen(menuOpen === docId ? null : docId);
  };

  const handleDelete = (e: React.MouseEvent, docId: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this document?')) {
      onDeleteDocument(docId);
    }
    setMenuOpen(null);
  };

  const handleDownload = (e: React.MouseEvent, doc: Document) => {
    e.stopPropagation();
    onDownloadDocument(doc);
    setMenuOpen(null);
  };

  return (
    <div className="p-4 rounded-xl border border-border bg-surface/50 h-full">
      <h3 className="font-semibold text-white mb-4">Documents</h3>
      <div className="space-y-2">
        {documents.map(doc => (
          <div
            key={doc.id}
            onClick={() => onSelectDocument(doc)}
            className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors cursor-pointer ${selectedDocument?.id === doc.id ? 'bg-surface' : 'hover:bg-surface/50'
              }`}
          >
            <FileText size={20} className="text-secondary flex-shrink-0" />
            <div className="flex-1 overflow-hidden">
              <p className="font-medium text-white truncate">{doc.name}</p>
              <p className="text-xs text-secondary">Uploaded by {doc.uploader} on {doc.date}</p>
            </div>

            <div className="relative">
              <button
                onClick={(e) => handleMenuClick(e, doc.id)}
                className="p-1 hover:bg-surface rounded"
              >
                <MoreVertical size={16} className="text-secondary" />
              </button>

              {menuOpen === doc.id && (
                <div className="absolute right-0 top-8 bg-surface border border-border rounded-lg shadow-lg z-10 w-32">
                  <button
                    onClick={(e) => handleDownload(e, doc)}
                    className="w-full flex items-center gap-2 p-2 text-sm text-white hover:bg-surface/50"
                  >
                    <Download size={14} />
                    Download
                  </button>
                  <button
                    onClick={(e) => handleDelete(e, doc.id)}
                    className="w-full flex items-center gap-2 p-2 text-sm text-red-400 hover:bg-surface/50"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {documents.length === 0 && (
          <div className="text-center text-secondary py-8">
            <FileText size={48} className="mx-auto mb-4 opacity-50" />
            <p className="font-medium mb-2">No documents found</p>
            <p className="text-sm">This category doesn't contain any documents yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentList;