// components/features/vdr/annotations/AnnotationsSection.tsx
'use client';

import { useState, FC, useEffect } from 'react';
import { AnnotatedDocument, AnnotationThread } from '../../../../types';
import DocumentListPanel from './DocumentListPanel';
import DocumentViewer from './DocumentViewer';
import CommentsPanel from './CommentsPanel';

interface AnnotationsSectionProps {
  documents: AnnotatedDocument[];
  activeDocument: AnnotatedDocument | null;
  onSelectDocument: (doc: AnnotatedDocument | null) => void;
  threads: AnnotationThread[];
  refreshThreads: () => void;
}

const AnnotationsSection: FC<AnnotationsSectionProps> = ({
  documents,
  activeDocument,
  onSelectDocument,
  threads,
  refreshThreads
}) => {
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

  // Auto-select first thread when threads change
  useEffect(() => {
    if (threads.length > 0 && !activeThreadId) {
      setActiveThreadId(threads[0].id);
    } else if (threads.length === 0) {
      setActiveThreadId(null);
    }
  }, [threads, activeThreadId]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[80vh]">
      {/* Document List */}
      <div className="lg:col-span-3">
        <DocumentListPanel
          documents={documents}
          activeDocument={activeDocument}
          onSelectDocument={onSelectDocument}
        />
      </div>

      {/* Document Viewer */}
      <div className="lg:col-span-6">
        <DocumentViewer
          document={activeDocument}  // This will be passed as selectedDocument in the child
          threads={threads}
          activeThreadId={activeThreadId}
          onSelectThread={setActiveThreadId}
          onRefreshThreads={refreshThreads}
        />
      </div>

      {/* Comments Panel */}
      <div className="lg:col-span-3">
        <CommentsPanel
          activeThread={threads.find(t => t.id === activeThreadId) || null}
          onCommentPosted={refreshThreads}
          onThreadResolved={refreshThreads}
        />
      </div>
    </div>
  );
};

export default AnnotationsSection;