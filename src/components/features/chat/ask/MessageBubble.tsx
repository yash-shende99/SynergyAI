import { FC } from 'react';
import { ChatMessage } from '../../../../types';
import { User, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import TypewriterText from './TypewriterText'; // <-- Import the new component

const MessageBubble: FC<{ message: ChatMessage }> = ({ message }) => {
  const isAI = message.role === 'assistant';

  return (
    <div className={`flex items-start gap-3 ${isAI ? '' : 'justify-end'}`}>
      {isAI && (
        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
          <Bot size={20} className="text-white" />
        </div>
      )}
      <div className={`p-3 rounded-lg max-w-lg ${isAI ? 'bg-surface' : 'bg-primary'}`}>
        {/* --- THIS IS THE FIX --- */}
        {/* If the message is from the AI, we use the Typewriter. Otherwise, we show the user's message instantly. */}
        {isAI ? (
          <TypewriterText text={message.content} />
        ) : (
          <div className="prose prose-sm prose-invert max-w-none prose-p:my-0 text-white">
            <ReactMarkdown>{message.content}</ReactMarkdown>
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