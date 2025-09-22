import { FC } from 'react';

interface CommentThreadProps {
  thread: {
    user: string;
    text: string;
    replies: { user: string; text: string }[];
  }
}

const CommentThread: FC<CommentThreadProps> = ({ thread }) => {
  const isAI = thread.user === 'AI Assistant';
  return (
    <div className={`p-3 rounded-lg ${isAI ? 'bg-red-500/10 border border-red-500/30' : 'bg-background/50'}`}>
      <div className="flex items-center gap-2 mb-2">
        <img src={`https://placehold.co/24x24/E2E8F0/111827?text=${thread.user[0]}`} className="h-6 w-6 rounded-full" />
        <span className={`text-sm font-semibold ${isAI ? 'text-red-400' : 'text-white'}`}>{thread.user}</span>
      </div>
      <p className="text-sm text-slate-300">{thread.text}</p>
      
      {thread.replies.map((reply, index) => (
         <div key={index} className="mt-3 pt-2 border-t border-border/50 flex items-start gap-2">
            <img src={`https://placehold.co/24x24/E2E8F0/111827?text=${reply.user[0]}`} className="h-6 w-6 rounded-full mt-1" />
            <div>
              <span className="text-sm font-semibold text-white">{reply.user}</span>
              <p className="text-sm text-slate-400">{reply.text}</p>
            </div>
         </div>
      ))}

      <textarea 
        placeholder="Reply..."
        className="w-full mt-3 p-2 bg-surface/50 border border-border rounded-md text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary"
        rows={2}
      />
    </div>
  );
};

export default CommentThread;