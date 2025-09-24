'use client';

import { FC, useState, useEffect } from 'react';
import { FileText, Loader2, ExternalLink } from 'lucide-react';
import { supabase } from '../../../../lib/supabaseClient';

interface Document {
  id: string;
  name: string;
  uploader: string;
  date: string;
  file_path?: string;
  category?: string;
  analysis_status?: string;
}

interface DocumentPreviewProps {
  document: Document | null;
  projectId?: string;
}

const DocumentPreview: FC<DocumentPreviewProps> = ({ document, projectId }) => {
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (document) {
      loadPdfDocument(document);
    } else {
      resetPdfViewer();
    }

    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [document]);

  const loadPdfDocument = async (doc: Document) => {
    setIsLoading(true);
    setError('');
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`http://localhost:8000/api/vdr/documents/${doc.id}/download`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to load PDF: ${response.status}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
      
      setPdfUrl(url);
      
    } catch (err) {
      setError('Failed to load PDF document');
      console.error('PDF loading error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPdfViewer = () => {
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
    }
    setPdfUrl('');
    setError('');
  };

  const getFileIcon = () => {
    return <FileText className="text-red-400" size={20} />;
  };

  const openInNewTab = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    }
  };

  if (!document) {
    return (
      <div className="p-4 rounded-xl border border-border bg-surface/50 h-full flex items-center justify-center">
        <p className="text-secondary">Select a document to preview</p>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl border border-border bg-surface/50 h-full flex flex-col">
      {/* Header */}
      <div className="pb-3 border-b border-border mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {getFileIcon()}
            <h3 className="font-semibold text-white truncate">{document.name}</h3>
          </div>
          <div className="flex items-center gap-2">
            {projectId && (
              <span className="text-xs text-secondary bg-surface px-2 py-1 rounded">
                Project
              </span>
            )}
            {pdfUrl && (
              <button
                onClick={openInNewTab}
                className="p-1 text-secondary hover:text-primary transition-colors"
                title="Open in new tab"
              >
                <ExternalLink size={16} />
              </button>
            )}
          </div>
        </div>
        <p className="text-xs text-secondary">Uploaded by {document.uploader} on {document.date}</p>
        {document.category && (
          <p className="text-xs text-primary mt-1">Category: {document.category}</p>
        )}
      </div>

      {/* PDF Viewer Area */}
      <div className="flex-1 bg-background/50 rounded-lg flex flex-col overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
            <span className="text-secondary">Loading PDF...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <FileText className="h-12 w-12 text-red-400 mx-auto mb-2" />
              <p className="text-red-400">{error}</p>
              <p className="text-secondary text-sm mt-1">Failed to load PDF document</p>
            </div>
          </div>
        ) : pdfUrl ? (
          <div className="flex-1 flex flex-col">
            <iframe
              src={pdfUrl}
              className="flex-1 w-full border-0"
              title={`PDF Viewer - ${document.name}`}
              style={{ minHeight: '500px' }}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <FileText className="h-12 w-12 text-secondary mx-auto mb-2" />
              <p className="text-secondary">No document loaded</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentPreview;