import { FC } from 'react';
import { User, Bot, FileText } from 'lucide-react';

const MessageBubble: FC<{ message: any, onSourceClick: (source: any) => void }> = ({ message, onSourceClick }) => {
  const isAI = message.from === 'ai';

  return (
    <div className={`flex items-start gap-3 ${isAI ? '' : 'justify-end'}`}>
      {isAI && (
        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
          <Bot size={20} className="text-white" />
        </div>
      )}
      <div className={`p-3 rounded-lg max-w-lg ${isAI ? 'bg-surface' : 'bg-primary'}`}>
        <p className="text-white text-sm">{message.text}</p>
        {isAI && message.sources && (
          <div className="mt-3 pt-2 border-t border-border/50 space-y-2">
            <h5 className="text-xs font-semibold text-secondary">Sources:</h5>
            {message.sources.map((source: any, index: number) => (
              <button 
                key={index}
                onClick={() => onSourceClick(source)}
                className="w-full flex items-start gap-2 p-2 rounded-md bg-background/50 hover:bg-surface text-left"
              >
                <FileText size={16} className="text-secondary mt-0.5"/>
                <div>
                  <p className="text-xs font-semibold text-primary">{source.docName}</p>
                  <p className="text-xs text-secondary truncate">"{source.excerpt}"</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      {!isAI && (
        <div className="h-8 w-8 rounded-full bg-surface flex items-center justify-center flex-shrink-0">
          <User size={20} className="text-secondary" />
        </div>
      )}
    </div>
  );
};

export default MessageBubble;