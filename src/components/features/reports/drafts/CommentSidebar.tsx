'use client';

import { FC, useState, useEffect } from 'react';
import { MessageSquare, Clock, Plus, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../../../ui/button';
import CommentItem from './CommentItem';
import { useCommentsStore } from '../../../../store/commentsStore';
import { DocumentAnnotation } from '../../../../types';
import VersionHistory from './VersionHistory';

interface CommentSidebarProps {
  documentId?: string;
  projectId?: string;
  onRestoreVersion?: (content: string) => void; // ✅ Add this prop
}

const CommentSidebar: FC<CommentSidebarProps> = ({
  documentId = 'current-draft',
  projectId = 'current-project',
  onRestoreVersion
}) => {
  const [activeTab, setActiveTab] = useState<'comments' | 'history'>('comments');
  const [newComment, setNewComment] = useState('');

  const {
    annotations,
    addAnnotation,
    addComment,
    addReply,
    resolveAnnotation,
    deleteComment,
    getAnnotationsForDocument,
    setCurrentDocument,
  } = useCommentsStore();

  // Set current document when component mounts
  useEffect(() => {
    setCurrentDocument(documentId);
  }, [documentId, setCurrentDocument]);

  const documentAnnotations = getAnnotationsForDocument(documentId);
  const unresolvedCount = documentAnnotations.length;

  const handleAddComment = () => {
    if (newComment.trim()) {
      // Create a new annotation with the comment
      addAnnotation({
        documentId,
        projectId,
        createdByUserId: 'current-user', // You'd get this from your auth context
        highlightedText: '', // This would come from text selection in the editor
        commentThread: [{
          id: `comment-${Date.now()}`,
          userId: 'current-user',
          userName: 'You',
          text: newComment.trim(),
          timestamp: new Date().toISOString(),
          type: 'comment',
        }],
        resolved: false,
      });
      setNewComment('');
    }
  };

  const handleAddReply = (annotationId: string, parentCommentId: string, text: string) => {
    addReply(annotationId, parentCommentId, {
      userId: 'current-user',
      userName: 'You',
      text,
      timestamp: new Date().toISOString(),
      type: 'comment',
    });
  };

  const handleDeleteComment = (annotationId: string, commentId: string) => {
    deleteComment(annotationId, commentId);
  };

  const handleResolveAnnotation = (annotationId: string) => {
    resolveAnnotation(annotationId);
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
  <div className="bg-surface/50 rounded-xl border border-border h-full flex flex-col">
    {/* Tabs */}
    <div className="flex border-b border-border">
      <button
        onClick={() => setActiveTab('comments')}
        className={`flex-1 p-3 text-sm font-semibold flex items-center justify-center gap-2 ${
          activeTab === 'comments' ? 'text-primary border-b-2 border-primary' : 'text-secondary'
        }`}
      >
        <MessageSquare size={16} />
        Comments
        {unresolvedCount > 0 && (
          <span className="bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unresolvedCount}
          </span>
        )}
      </button>
      <button
        onClick={() => setActiveTab('history')}
        className={`flex-1 p-3 text-sm font-semibold flex items-center justify-center gap-2 ${
          activeTab === 'history' ? 'text-primary border-b-2 border-primary' : 'text-secondary'
        }`}
      >
        <Clock size={16} /> Version History
      </button>
    </div>

    <div className="flex-1 p-4 overflow-y-auto">
      {activeTab === 'comments' ? (
        <div className="space-y-4">
          {/* New Comment Input */}
          <div className="bg-background/50 rounded-lg p-3 border border-border">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full bg-transparent border-none resize-none text-sm text-white placeholder-secondary focus:outline-none"
              rows={3}
            />
            <div className="flex justify-end mt-2">
              <Button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                size="sm"
                className="text-xs"
              >
                <Plus size={14} className="mr-1" />
                Comment
              </Button>
            </div>
          </div>

          {/* Comments List */}
          {documentAnnotations.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare size={48} className="text-secondary mx-auto mb-3 opacity-50" />
              <p className="text-secondary text-sm">No comments yet</p>
              <p className="text-secondary text-xs mt-1">Add the first comment to start the discussion</p>
            </div>
          ) : (
            <div className="space-y-4">
              {documentAnnotations.map((annotation) => (
                <div key={annotation.id} className="bg-background/30 rounded-lg p-3 border border-border/50">
                  {/* Annotation Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-xs text-secondary">
                        {annotation.highlightedText ? 'Text selection' : 'General comment'}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleResolveAnnotation(annotation.id)}
                      className="h-6 px-2 text-xs text-green-400 hover:text-green-300"
                    >
                      <CheckCircle size={12} className="mr-1" />
                      Resolve
                    </Button>
                  </div>

                  {/* Comments Thread */}
                  <div className="space-y-3">
                    {annotation.commentThread.map((comment) => (
                      <CommentItem
                        key={comment.id}
                        comment={comment}
                        onReply={(parentCommentId, text) =>
                          handleAddReply(annotation.id, parentCommentId, text)
                        }
                        onDelete={(commentId) =>
                          handleDeleteComment(annotation.id, commentId)
                        }
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Version History Tab - CORRECTED SYNTAX */
        <VersionHistory
          documentId={documentId}
          onRestoreVersion={onRestoreVersion}
        />
      )}
    </div>
  </div>
);
};

export default CommentSidebar;