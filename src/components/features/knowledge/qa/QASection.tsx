'use client';

import { FC } from 'react';
// --- THIS IS THE FIX: We import the necessary types from React ---
import React from 'react'; 
import { VdrConversation, VdrSource } from '../../../../types';
import ChatPanel from './ChatPanel';
import SourceDocumentViewer from './SourceDocumentViewer';

interface QASectionProps {
  projectId: string;
  conversation: VdrConversation | null;
  // This is the correct, professional type for a state setter function
  setConversation: React.Dispatch<React.SetStateAction<VdrConversation | null>>;
  activeSource: VdrSource | null;
  setActiveSource: (source: VdrSource | null) => void;
}

const QASection: FC<QASectionProps> = ({ projectId, conversation, setConversation, activeSource, setActiveSource }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[80vh]">
      <div>
        <ChatPanel 
          projectId={projectId}
          conversation={conversation}
          setConversation={setConversation}
          onSourceClick={setActiveSource} 
        />
      </div>
      <div>
        <SourceDocumentViewer source={activeSource} />
      </div>
    </div>
  );
};

export default QASection;