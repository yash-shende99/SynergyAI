import { FC, useEffect, useState } from 'react';
import { VdrSearchResult } from '../../../../types';
import { supabase } from '../../../../lib/supabaseClient';

const DocumentPreviewPanel: FC<{ selectedResult: VdrSearchResult | null }> = ({ selectedResult }) => {
  const [token, setToken] = useState<string>('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setToken(session.access_token);
    });
  }, []);

  if (!selectedResult) {
    return <div className="p-4 rounded-xl border border-border bg-surface/50 h-full flex items-center justify-center"><p className="text-secondary">Select a search result to preview</p></div>;
  }
  return (
    <div className="p-4 rounded-xl border border-border bg-surface/50 h-full flex flex-col">
       <h3 className="font-semibold text-white truncate pb-3 border-b border-border mb-4">{selectedResult.docName}</h3>
       <div className="flex-1 bg-background/50 rounded-lg p-4 text-sm text-secondary overflow-y-auto">
         {selectedResult.id && token ? (
           selectedResult.docName.toLowerCase().endsWith('.pdf') ? (
             <object 
               data={`http://localhost:8000/api/knowledge/documents/${selectedResult.id}/download?token=${token}`} 
               type="application/pdf"
               className="w-full h-full rounded-md min-h-[500px]"
             >
               <div className="flex flex-col items-center justify-center h-full gap-4">
                 <p className="text-muted-foreground">Unable to display PDF directly.</p>
                 <a 
                   href={`http://localhost:8000/api/knowledge/documents/${selectedResult.id}/download?token=${token}`} 
                   download
                   className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                 >
                   Download PDF
                 </a>
               </div>
             </object>
           ) : (
             <div className="flex flex-col items-center justify-center h-full gap-4">
               <p className="text-muted-foreground">Word documents cannot be previewed in the browser.</p>
               <a 
                 href={`http://localhost:8000/api/knowledge/documents/${selectedResult.id}/download?token=${token}`} 
                 download
                 className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
               >
                 Download Document
               </a>
             </div>
           )
         ) : (
           <>
             <p className="text-muted-foreground italic mb-4">Select a document to preview</p>
             <p dangerouslySetInnerHTML={{ __html: selectedResult.excerpt.replace(/<mark>/g, '<mark class="bg-primary/30 text-white rounded px-1">') }} />
           </>
         )}
       </div>
    </div>
  );
};
export default DocumentPreviewPanel;