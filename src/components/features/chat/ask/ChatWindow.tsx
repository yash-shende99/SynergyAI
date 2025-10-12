import { FC, useRef, useEffect } from 'react';
import { ChatMessage } from '../../../../types';
import MessageBubble from './MessageBubble';
import AILoadingBubble from './AILoadingBubble'; // <-- Import the new loading component

const ChatWindow: FC<{ messages: ChatMessage[], isLoading: boolean }> = ({ messages, isLoading }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]); // Scroll when loading starts too

  return (
    <div className="p-4 space-y-4">
      {messages.map((msg, index) => (
        <MessageBubble key={index} message={msg} />
      ))}
      
      {isLoading && <AILoadingBubble />}

      <div ref={scrollRef} />
    </div>
  );
};
export default ChatWindow;