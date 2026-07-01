// components/features/vdr/annotations/CommentsPanel.tsx
'use client';

import { FC, useState } from 'react';
import { AnnotationThread } from '../../../../types';
import CommentThread from './CommentThread';
import { MessageSquare, CheckCircle, XCircle, User } from 'lucide-react';
import { supabase } from '../../../../lib/supabaseClient';

interface CommentsPanelProps {
  activeThread: AnnotationThread | null;
  onCommentPosted: () => void;
  onThreadResolved: () => void;
}

// Safe function to get user avatar URL
const getSafeAvatarUrl = (thread: AnnotationThread | null) => {
  if (!thread?.createdBy?.avatarUrl) {
    const userName = thread?.createdBy?.name || 'U';
    const firstChar = userName.charAt ? userName.charAt(0) : 'U';
    return `https://placehold.co/24x24/1F2937/9CA3AF?text=${firstChar}`;
  }
  return thread.createdBy.avatarUrl;
};

// Safe function to get user name
const getSafeUserName = (thread: AnnotationThread | null) => {
  return thread?.createdBy?.name || 'Unknown User';
};

const CommentsPanel: FC<CommentsPanelProps> = ({ 
  activeThread, 
  onCommentPosted, 
  onThreadResolved 
}) => {
  const [isResolving, setIsResolving] = useState(false);

  const handleResolveToggle = async () => {
    if (!activeThread) return;
    
    setIsResolving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch(`http://localhost:8000/api/annotations/${activeThread.id}/resolve`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          resolved: !activeThread.resolved
        })
      });

      if (!response.ok) throw new Error("Failed to update resolution status");
      
      onThreadResolved();
      
    } catch (error) {
      console.error("Error updating resolution:", error);
      alert("Failed to update resolution status");
    } finally {
      setIsResolving(false);
    }
  };

  if (!activeThread) {
    return (
      <div className="p-4 rounded-xl border border-border bg-surface/50 h-full flex items-center justify-center">
        <div className="text-center text-secondary">
          <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
          <p>Select an annotation to view comments</p>
          <p className="text-sm mt-2">Click on highlighted text in the document</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl border border-border bg-surface/50 h-full flex flex-col">
      {/* Thread Header */}
      <div className="pb-3 border-b border-border mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-white">Annotation</h3>
          <button
            onClick={handleResolveToggle}
            disabled={isResolving}
            className={`flex items-center gap-2 px-3 py-1 rounded text-sm font-medium transition-colors ${
              activeThread.resolved
                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                : 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
            } disabled:opacity-50`}
          >
            {activeThread.resolved ? (
              <>
                <CheckCircle size={14} />
                Resolved
              </>
            ) : (
              <>
                <XCircle size={14} />
                Mark Resolved
              </>
            )}
          </button>
        </div>
        
        {/* Highlighted Text */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded p-3 mb-3">
          <p className="text-sm text-amber-300 italic">"{activeThread.highlightedText}"</p>
        </div>
        
        {/* Thread Info */}
        <div className="flex items-center gap-2 text-xs text-secondary">
          <img 
            src={getSafeAvatarUrl(activeThread)}
            className="h-4 w-4 rounded-full"
            alt={getSafeUserName(activeThread)}
          />
          <span>By {getSafeUserName(activeThread)}</span>
          <span>•</span>
          <span>{new Date(activeThread.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Comments */}
      <div className="flex-1 overflow-hidden">
        <CommentThread 
          thread={activeThread} 
          onReply={onCommentPosted}
        />
      </div>
    </div>
  );
};

export default CommentsPanel;