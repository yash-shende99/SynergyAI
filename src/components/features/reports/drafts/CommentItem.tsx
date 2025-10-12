'use client';

import { FC, useState } from 'react';
import { Comment } from '../../../../types';
import { MessageCircle, Reply, Trash2, CheckCircle } from 'lucide-react';
import { Button } from '../../../ui/button';

interface CommentItemProps {
  comment: Comment;
  onReply: (parentCommentId: string, text: string) => void;
  onDelete: (commentId: string) => void;
  showActions?: boolean;
}

const CommentItem: FC<CommentItemProps> = ({ comment, onReply, onDelete, showActions = true }) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');

  const handleSubmitReply = () => {
    if (replyText.trim()) {
      onReply(comment.id, replyText.trim());
      setReplyText('');
      setIsReplying(false);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="border-l-2 border-primary/20 pl-3">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {comment.avatarUrl ? (
            <img 
              src={comment.avatarUrl} 
              alt={comment.userName}
              className="h-8 w-8 rounded-full"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
              <MessageCircle size={16} className="text-primary" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-white">{comment.userName}</span>
            <span className="text-xs text-secondary">{formatTime(comment.timestamp)}</span>
          </div>
          <p className="text-sm text-slate-300 mb-2">{comment.text}</p>
          
          {showActions && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsReplying(!isReplying)}
                className="h-6 px-2 text-xs text-secondary hover:text-white"
              >
                <Reply size={12} className="mr-1" />
                Reply
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(comment.id)}
                className="h-6 px-2 text-xs text-red-400 hover:text-red-300"
              >
                <Trash2 size={12} className="mr-1" />
                Delete
              </Button>
            </div>
          )}

          {isReplying && (
            <div className="mt-2">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                className="w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-white placeholder-secondary resize-none focus:outline-none focus:border-primary"
                rows={2}
              />
              <div className="flex justify-end gap-2 mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsReplying(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleSubmitReply}
                  className="text-xs"
                >
                  Reply
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onDelete={onDelete}
              showActions={false}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentItem;