'use client';

import { useState } from 'react';
import { MessageSquare, Clock } from 'lucide-react';

const CommentSidebar = () => {
  const [activeTab, setActiveTab] = useState('Comments');

  return (
    <div className="bg-surface/50 rounded-xl border border-border h-full flex flex-col">
      <div className="flex border-b border-border">
        <button onClick={() => setActiveTab('Comments')} className={`flex-1 p-2 text-sm font-semibold flex items-center justify-center gap-2 ${activeTab === 'Comments' ? 'text-primary' : 'text-secondary'}`}>
          <MessageSquare size={16}/> Comments
        </button>
        <button onClick={() => setActiveTab('History')} className={`flex-1 p-2 text-sm font-semibold flex items-center justify-center gap-2 ${activeTab === 'History' ? 'text-primary' : 'text-secondary'}`}>
          <Clock size={16}/> Version History
        </button>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        {activeTab === 'Comments' && (
          <div className="text-center text-secondary text-sm pt-16">
            <p>Highlight text in the editor to add a new comment.</p>
          </div>
        )}
        {activeTab === 'History' && (
           <div className="text-center text-secondary text-sm pt-16">
            <p>A timeline of all document changes will be shown here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSidebar;