import { FC } from 'react';
import { VdrSearchResult } from '../../../../types';

const DocumentPreviewPanel: FC<{ selectedResult: VdrSearchResult | null }> = ({ selectedResult }) => {
  if (!selectedResult) {
    return <div className="p-4 rounded-xl border border-border bg-surface/50 h-full flex items-center justify-center"><p className="text-secondary">Select a search result to preview</p></div>;
  }
  return (
    <div className="p-4 rounded-xl border border-border bg-surface/50 h-full flex flex-col">
       <h3 className="font-semibold text-white truncate pb-3 border-b border-border mb-4">{selectedResult.docName}</h3>
       <div className="flex-1 bg-background/50 rounded-lg p-4 text-sm text-secondary overflow-y-auto">
         <p>[Full document content with matched text highlighted would appear here.]</p>
         <br/>
         <p dangerouslySetInnerHTML={{ __html: selectedResult.excerpt.replace(/<mark>/g, '<mark class="bg-primary/30 text-white rounded px-1">') }} />
       </div>
    </div>
  );
};
export default DocumentPreviewPanel;