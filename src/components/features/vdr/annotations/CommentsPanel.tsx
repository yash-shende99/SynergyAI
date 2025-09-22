import { FC } from 'react';
import CommentThread from './CommentThread';
import { Thread, ThreadKey } from './AnnotationsSection'; // Import shared types

interface CommentsPanelProps {
  activeThreadId: ThreadKey | null;
  threads: Record<ThreadKey, Thread>; // Expect the full object of threads
}

const CommentsPanel: FC<CommentsPanelProps> = ({ activeThreadId, threads }) => {
  // This line is now type-safe
  const thread = activeThreadId ? threads[activeThreadId] : null;

  return (
    <div className="p-4 rounded-xl border border-border bg-surface/50 h-full">
      <h3 className="font-semibold text-white mb-4">Comments & Annotations</h3>
      {thread ? (
        <CommentThread thread={thread} />
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-secondary text-sm">Select an annotation to view comments.</p>
        </div>
      )}
    </div>
  );
};

export default CommentsPanel;