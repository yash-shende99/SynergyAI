import { FC } from 'react';
import { Conversation } from '../../../../types';
import { Search } from 'lucide-react';

interface ConvoListProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  onSelectConversation: (convo: Conversation) => void;
}

const ConversationListPanel: FC<ConvoListProps> = ({ conversations, selectedConversation, onSelectConversation }) => (
    <div className="p-4 rounded-xl border border-border bg-surface/50 h-full flex flex-col">
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" size={18} />
        <input type="text" placeholder="Search history..." className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm"/>
      </div>
      <div className="space-y-2 flex-1 overflow-y-auto">
        {conversations.map(convo => (
          <button key={convo.id} onClick={() => onSelectConversation(convo)} className={`w-full text-left p-3 rounded-lg transition-colors ${selectedConversation?.id === convo.id ? 'bg-surface' : 'hover:bg-surface/50'}`}>
            <p className="font-semibold text-white text-sm truncate">{convo.title}</p>
            <p className="text-xs text-secondary">{convo.messages.length} messages • {new Date(convo.lastUpdated).toLocaleDateString()}</p>
          </button>
        ))}
      </div>
    </div>
);
export default ConversationListPanel;