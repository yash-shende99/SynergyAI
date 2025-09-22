import { FC } from 'react';

interface DocumentPreviewPanelProps {
  selectedResult: { docName: string, excerpt: string } | null;
}

const DocumentPreviewPanel: FC<DocumentPreviewPanelProps> = ({ selectedResult }) => {
  if (!selectedResult) {
    return (
      <div className="p-4 rounded-xl border border-border bg-surface/50 h-full flex items-center justify-center">
        <p className="text-secondary">Select a search result to preview the document</p>
      </div>
    );
  }
  return (
    <div className="p-4 rounded-xl border border-border bg-surface/50 h-full flex flex-col">
       <div className="pb-3 border-b border-border mb-4">
        <h3 className="font-semibold text-white truncate">{selectedResult.docName}</h3>
      </div>
      <div className="flex-1 bg-background/50 rounded-lg p-4 text-sm text-secondary overflow-y-auto">
        <p>[Full document content with matched text highlighted would appear here.]</p>
        <br/>
        <p dangerouslySetInnerHTML={{ __html: selectedResult.excerpt.replace(/<mark>/g, '<mark class="bg-primary/30 text-white">') }} />
      </div>
    </div>
  );
};

export default DocumentPreviewPanel;