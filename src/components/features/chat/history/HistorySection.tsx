'use client';

import { useState } from 'react';
import { Conversation } from '../../../../types';
import ConversationListPanel from './ConversationListPanel';
import ConversationViewPanel from './ConversationViewPanel';

const HistorySection: React.FC<{ conversations: Conversation[] }> = ({ conversations }) => {
  const [selectedConvo, setSelectedConvo] = useState<Conversation | null>(
    conversations.length > 0 ? conversations[0] : null
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[80vh]">
      <div className="lg:col-span-1">
        <ConversationListPanel
          conversations={conversations}
          selectedConversation={selectedConvo}
          onSelectConversation={setSelectedConvo}
        />
      </div>
      <div className="lg:col-span-2">
        <ConversationViewPanel conversation={selectedConvo} />
      </div>
    </div>
  );
};
export default HistorySection;