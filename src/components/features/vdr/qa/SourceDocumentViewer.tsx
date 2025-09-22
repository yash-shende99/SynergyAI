import { FC } from 'react';

interface SourceDocumentViewerProps {
  source: { docName: string, excerpt: string } | null;
}

const SourceDocumentViewer: FC<SourceDocumentViewerProps> = ({ source }) => {
  if (!source) {
    return (
      <div className="p-4 rounded-xl border border-border bg-surface/50 h-full flex items-center justify-center">
        <p className="text-secondary">Click a source to view the document</p>
      </div>
    );
  }
  return (
    <div className="p-4 rounded-xl border border-border bg-surface/50 h-full flex flex-col">
       <div className="pb-3 border-b border-border mb-4">
        <h3 className="font-semibold text-white truncate">{source.docName}</h3>
      </div>
      <div className="flex-1 bg-background/50 rounded-lg p-4 text-sm text-secondary overflow-y-auto">
        <p>[Full document content with the source excerpt highlighted would appear here.]</p>
        <br/>
        <p>
          ... This agreement may be terminated by either party with 
          <mark className="bg-primary/30 text-white mx-1 px-1 rounded">ninety (90) days written notice.</mark> 
          This is a critical clause...
        </p>
      </div>
    </div>
  );
};

export default SourceDocumentViewer;