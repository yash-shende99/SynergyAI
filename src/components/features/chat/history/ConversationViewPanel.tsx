import { FC } from 'react';
import { Conversation } from '../../../../types';
import { Pin, Share, Download, MessageSquarePlus } from 'lucide-react';
import { Button } from '../../../ui/button';
import MessageBubble from '../ask/MessageBubble'; // Reusing our message bubble
import { useRouter } from 'next/navigation';

const ConversationViewPanel: FC<{ conversation: Conversation | null }> = ({ conversation }) => {
  const router = useRouter();
  const handleContinueChat = () => {
    if (!conversation) return;

    // Store the conversation in sessionStorage to pass to the chat page
    sessionStorage.setItem('continueConversation', JSON.stringify({
      id: conversation.id,
      messages: conversation.messages
    }));

    router.push('/dashboard/chat');
  };
  if (!conversation) {
    return <div className="p-4 rounded-xl border border-border bg-surface/50 h-full flex items-center justify-center"><p className="text-secondary">Select a conversation to view.</p></div>;
  }

  return (
    <div className="p-4 rounded-xl border border-border bg-surface/50 h-full flex flex-col">
      <div className="flex justify-between items-center pb-3 border-b border-border mb-4">
        <h3 className="font-bold text-white truncate">{conversation.title}</h3>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleContinueChat}
            variant="secondary"
            size="sm"
          >
            <MessageSquarePlus size={16} className="mr-2" />
            Continue Chat
          </Button>
        </div>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto pr-2">
        {conversation.messages.map((message, index) => (
          <MessageBubble key={index} message={message} />
        ))}
      </div>
    </div>
  );
};
export default ConversationViewPanel;