'use client';

import { useState } from 'react';
import ChatPanel from './ChatPanel';
import SourceDocumentViewer from './SourceDocumentViewer';

export default function QASection() {
  const [activeSource, setActiveSource] = useState({
    docName: 'Master Service Agreement.docx',
    excerpt: '...upon a change of control, the acquirer must provide written notice...',
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      {/* Left Panel: Chat Interface */}
      <div>
        <ChatPanel onSourceClick={setActiveSource} />
      </div>

      {/* Right Panel: Source Document Viewer */}
      <div>
        <SourceDocumentViewer source={activeSource} />
      </div>
    </div>
  );
}