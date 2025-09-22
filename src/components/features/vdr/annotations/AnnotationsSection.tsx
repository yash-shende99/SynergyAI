'use client';

import { useState } from 'react';
import DocumentListPanel from './DocumentListPanel';
import DocumentViewer from './DocumentViewer';
import CommentsPanel from './CommentsPanel';

// --- FIX STARTS HERE ---
// 1. Define the specific, valid keys for our mock threads
export type ThreadKey = 'thread-01' | 'thread-02';

// 2. Define the structure of a thread
export interface Thread {
  user: string;
  text: string;
  replies: { user: string; text: string }[];
}

// 3. Explicitly type our mockThreads object
const mockThreads: Record<ThreadKey, Thread> = {
  'thread-01': { user: 'Ananya Sharma', text: 'Should we negotiate this down to 3 years? Seems long.', replies: [{ user: 'Rohan Kapoor', text: 'Agreed. Let\'s bring this up in the next call.' }] },
  'thread-02': { user: 'AI Assistant', text: 'Risk Detected: This Change of Control clause lacks specificity. Recommend clarifying the definition of "control".', replies: [] },
};
// --- FIX ENDS HERE ---

export default function AnnotationsSection() {
  const [activeDocument, setActiveDocument] = useState('Master Service Agreement.docx');
  // Use our specific ThreadKey type for the state
  const [activeThreadId, setActiveThreadId] = useState<ThreadKey | null>('thread-01');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
      <div className="lg:col-span-3">
        <DocumentListPanel 
          activeDocument={activeDocument}
          onSelectDocument={setActiveDocument}
        />
      </div>
      <div className="lg:col-span-6">
        <DocumentViewer 
          documentName={activeDocument}
          activeThreadId={activeThreadId}
          onSelectThread={setActiveThreadId}
        />
      </div>
      <div className="lg:col-span-3">
        <CommentsPanel 
          activeThreadId={activeThreadId}
          threads={mockThreads} // Pass down the full threads object
        />
      </div>
    </div>
  );
}