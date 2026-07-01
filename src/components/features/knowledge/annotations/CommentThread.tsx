// components/features/vdr/annotations/CommentThread.tsx
'use client';

import { FC, useState } from 'react';
import { AnnotationThread } from '../../../../types';
import { supabase } from '../../../../lib/supabaseClient';
import { Button } from '../../../ui/button';
import { Loader2, Send, User } from 'lucide-react';

interface CommentThreadProps {
  thread: AnnotationThread;
  onReply: () => void;
}

// Safe function for comment user data
const getSafeCommentAvatar = (comment: any) => {
  if (!comment?.avatarUrl) {
    const userName = comment?.userName || 'U';
    const firstChar = userName.charAt ? userName.charAt(0) : 'U';
    return `https://placehold.co/32x32/1F2937/9CA3AF?text=${firstChar}`;
  }
  return comment.avatarUrl;
};

const getSafeCommentUserName = (comment: any) => {
  return comment?.userName || 'Unknown User';
};

const CommentThread: FC<CommentThreadProps> = ({ thread, onReply }) => {
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  const handleReply = async () => {
    if (!replyText.trim()) return;
    
    setIsReplying(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch(`http://localhost:8000/api/annotations/${thread.id}/reply`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ comment_text: replyText })
      });

      if (!response.ok) throw new Error("Failed to post reply");
      
      setReplyText('');
      onReply(); // Refresh the thread
      
    } catch (error) {
      console.error("Failed to post reply:", error);
      alert("Error: Could not post reply.");
    } finally {
      setIsReplying(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Comments List */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {thread.comments && thread.comments.map((comment, index) => (
          <div key={comment.id || index} className="flex items-start gap-3">
            <img 
              src={getSafeCommentAvatar(comment)}
              className="h-8 w-8 rounded-full flex-shrink-0"
              alt={getSafeCommentUserName(comment)}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-white">
                  {getSafeCommentUserName(comment)}
                </span>
                <span className="text-xs text-secondary">
                  {comment.timestamp ? new Date(comment.timestamp).toLocaleString() : 'Unknown date'}
                </span>
              </div>
              <div className="bg-surface rounded-lg p-3">
                <p className="text-sm text-slate-300">{comment.text || 'No comment text'}</p>
              </div>
            </div>
          </div>
        ))}
        
        {/* Show message if no comments */}
        {(!thread.comments || thread.comments.length === 0) && (
          <div className="text-center text-secondary py-8">
            <User size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No comments yet</p>
            <p className="text-xs mt-1">Be the first to comment</p>
          </div>
        )}
      </div>

      {/* Reply Input */}
      <div className="border-t border-border pt-4">
        <textarea 
          placeholder="Type your reply..."
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          className="w-full p-3 bg-surface border border-border rounded-lg text-sm text-white placeholder-secondary resize-none focus:outline-none focus:border-primary"
          rows={3}
          disabled={isReplying}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
              handleReply();
            }
          }}
        />
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-secondary">
            Press Ctrl+Enter to send
          </span>
          <Button 
            onClick={handleReply} 
            size="sm" 
            disabled={!replyText.trim() || isReplying}
            className="flex items-center gap-2"
          >
            {isReplying ? (
              <Loader2 size={14} className="animate-spin"/>
            ) : (
              <Send size={14} />
            )}
            Reply
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CommentThread;