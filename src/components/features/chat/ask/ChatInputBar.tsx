import { FC, forwardRef, useState, useEffect } from 'react';
import { Paperclip, Mic, Send } from 'lucide-react';
import { Button } from '../../../ui/button';

interface ChatInputBarProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  initialValue?: string;
}

const ChatInputBar = forwardRef<HTMLTextAreaElement, ChatInputBarProps>(
  ({ onSendMessage, isLoading, initialValue = '' }, ref) => {
    const [message, setMessage] = useState(initialValue);

    // Update local state when initialValue changes
    useEffect(() => {
      setMessage(initialValue);
    }, [initialValue]);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (message.trim() && !isLoading) {
        onSendMessage(message);
        setMessage('');
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e);
      }
    };

  return (
    <form onSubmit={handleSubmit} className="p-4 rounded-xl border border-border bg-surface/80 backdrop-blur-sm">
      <div className="flex items-end gap-2 p-3 rounded-xl border border-border bg-surface/50">
          <Button type="button" variant="ghost" size="icon" className="flex-shrink-0">
            <Paperclip className="h-5 w-5 text-secondary" />
          </Button>
          
          <textarea
            ref={ref}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about your deals..."
            className="flex-1 bg-transparent text-white placeholder:text-secondary resize-none outline-none min-h-[40px] max-h-32 py-2"
            rows={1}
            disabled={isLoading}
          />
        {/* <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <button type="button" className="text-secondary hover:text-primary"><Paperclip size={20} /></button>
        </div> */}
        <button type="submit" disabled={isLoading} className="absolute right-6 top-1/2 -translate-y-1/2 text-white bg-primary p-2 rounded-md hover:bg-primary-hover disabled:bg-primary/50">
          <Send size={20} />
        </button>
      </div>
    </form>
  );
  }
);
export default ChatInputBar;