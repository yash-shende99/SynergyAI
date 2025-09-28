'use client';

import { FC, useState, useEffect } from 'react';
import { VdrSource } from '../../../../types';
import { FileText, Loader2, AlertTriangle, ExternalLink } from 'lucide-react';
import { supabase } from '../../../../lib/supabaseClient';

const SourceDocumentViewer: FC<{ source: VdrSource | null }> = ({ source }) => {
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (pdfUrl) { URL.revokeObjectURL(pdfUrl); }
    if (source && source.docId) { loadPdfDocument(source.docId); }
    else { setPdfUrl(''); }
    return () => { if (pdfUrl) { URL.revokeObjectURL(pdfUrl); }};
  }, [source]);

  const loadPdfDocument = async (docId: string) => {
    setIsLoading(true);
    setError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');
      const response = await fetch(`http://localhost:8000/api/vdr/documents/${docId}/download`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Failed to load PDF');
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!source) {
    return <div className="p-4 rounded-xl border border-border bg-surface/50 h-full flex items-center justify-center"><p className="text-secondary">Click on a source to view the document</p></div>;
  }

  return (
    <div className="p-4 rounded-xl border border-border bg-surface/50 h-full flex flex-col">
      <div className="flex justify-between items-center pb-3 border-b border-border mb-4">
        <h3 className="font-semibold text-white truncate">{source.docName}</h3>
        {pdfUrl && !isLoading && (
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="p-1 text-secondary hover:text-primary" title="Open in new tab">
                <ExternalLink size={16} />
            </a>
        )}
      </div>
      <div className="flex-1 bg-background/50 rounded-lg flex flex-col overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-secondary"><Loader2 className="h-8 w-8 animate-spin text-primary mr-2" /><span>Loading PDF...</span></div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full text-red-400 text-center"><AlertTriangle className="h-8 w-8 mb-2" /><p className="font-semibold">Error</p><p className="text-sm">{error}</p></div>
        ) : pdfUrl ? (
          <iframe src={pdfUrl} className="flex-1 w-full border-0" title={`PDF Viewer - ${source.docName}`} />
        ) : (
          <div className="flex items-center justify-center h-full text-secondary"><p>No document selected</p></div>
        )}
      </div>
    </div>
  );
};
export default SourceDocumentViewer;