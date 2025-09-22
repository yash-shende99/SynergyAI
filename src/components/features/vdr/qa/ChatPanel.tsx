import { FC } from 'react';
import MessageBubble from './MessageBubble';
import { Send } from 'lucide-react';

// Mock conversation data
const conversation = [
  { from: 'user', text: 'Summarize all contracts with termination clauses.' },
  { 
    from: 'ai', 
    text: 'I found two documents with termination clauses. The primary one is in the Master Service Agreement.',
    sources: [
      { docName: 'Master Service Agreement.docx', excerpt: '...this agreement may be terminated by either party with ninety (90) days written notice.' },
      { docName: 'Employee Handbook.pdf', excerpt: '...termination of employment is governed by the policies outlined in Section 4...' },
    ] 
  },
];

interface ChatPanelProps {
  onSourceClick: (source: any) => void;
}

const ChatPanel: FC<ChatPanelProps> = ({ onSourceClick }) => {
  return (
    <div className="p-4 rounded-xl border border-border bg-surface/50 h-full flex flex-col">
      <h3 className="font-semibold text-white mb-4">AI Q&A</h3>
      {/* Conversation History */}
      <div className="flex-1 space-y-4 overflow-y-auto pr-2">
        {conversation.map((msg, index) => (
          <MessageBubble key={index} message={msg} onSourceClick={onSourceClick} />
        ))}
      </div>
      {/* Input Box */}
      <div className="mt-4 relative">
        <input 
          type="text"
          placeholder="Ask a question about your documents..."
          className="w-full pl-4 pr-12 py-3 bg-background border border-border rounded-lg text-white placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button className="absolute right-3 top-1/2 -translate-y-1/2 text-primary p-1 rounded-md hover:bg-surface">
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default ChatPanel;