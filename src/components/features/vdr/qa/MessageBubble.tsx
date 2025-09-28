import { FC } from 'react';
import { VdrChatMessage, VdrSource } from '../../../../types';
import { User, Bot, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface MessageBubbleProps {
  message: VdrChatMessage;
  onSourceClick: (source: VdrSource) => void;
}

const MessageBubble: FC<MessageBubbleProps> = ({ message, onSourceClick }) => {
  const isAI = message.role === 'assistant';
  return (
    <div className={`flex items-start gap-3 ${isAI ? '' : 'justify-end'}`}>
      {isAI && <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0"><Bot size={20} className="text-white" /></div>}
      <div className={`p-3 rounded-lg max-w-lg ${isAI ? 'bg-surface' : 'bg-primary'}`}>
        <div className="prose prose-sm prose-invert max-w-none text-white prose-p:my-0"><ReactMarkdown>{message.content}</ReactMarkdown></div>
        {isAI && message.sources && message.sources.length > 0 && (
          <div className="mt-3 pt-2 border-t border-border/50 space-y-2">
            <h5 className="text-xs font-semibold text-secondary">Sources:</h5>
            {message.sources.map((source, index) => (
              <button key={index} onClick={() => onSourceClick(source)} className="w-full flex items-start gap-2 p-2 rounded-md bg-background/50 hover:bg-surface text-left">
                <FileText size={16} className="text-secondary mt-0.5 flex-shrink-0"/>
                <div>
                  <p className="text-xs font-semibold text-primary">{source.docName}</p>
                  <p className="text-xs text-secondary line-clamp-2">"{source.excerpt}"</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      {!isAI && <div className="h-8 w-8 rounded-full bg-surface flex items-center justify-center flex-shrink-0"><User size={20} className="text-secondary" /></div>}
    </div>
  );
};
export default MessageBubble;