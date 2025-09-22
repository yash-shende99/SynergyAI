'use client';

import { useState } from 'react';
import DraftsHeader from './DraftsHeader';
import DraftsTable from './DraftsTable';
import DraftsGrid from './DraftsGrid';
import CollaborativeEditorModal from './CollaborativeEditorModal';
import { useReportStore } from '../../../../store/reportStore'; // <-- 1. Import the store
import { Draft } from '../../../../types';

export default function DraftsSection() {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [editingDraft, setEditingDraft] = useState<Draft | null>(null);

  // --- THIS IS THE FIX ---
  // 2. Get the drafts and actions directly from our global Zustand store
  const { drafts, addDraft, deleteDraft, duplicateDraft } = useReportStore();

  const handleOpenEditor = (draft: Draft) => setEditingDraft(draft);
  const handleCloseEditor = () => setEditingDraft(null);
  
  const handleNewDraft = () => {
     const newDraft: Draft = { id: `draft-${Date.now()}`, title: 'Untitled Draft', createdBy: { name: 'Yash Shende', avatarUrl: '...' }, lastModified: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric'}), status: 'Draft' };
     addDraft(newDraft); // Use the global action
     setEditingDraft(newDraft);
  };

  return (
    <>
      <div className="space-y-6">
        <DraftsHeader 
          viewMode={viewMode}
          onViewChange={setViewMode}
          onNewDraft={handleNewDraft}
        />
        
        {viewMode === 'table' ? (
          <DraftsTable 
            drafts={drafts}
            onOpen={handleOpenEditor}
            onDelete={deleteDraft}       // Use the global action
            onDuplicate={duplicateDraft} // Use the global action
          />
        ) : (
          <DraftsGrid 
            drafts={drafts}
            onOpen={handleOpenEditor}
            onDelete={deleteDraft}       // Use the global action
            onDuplicate={duplicateDraft} // Use the global action
          />
        )}
      </div>
      
      <CollaborativeEditorModal 
        draft={editingDraft}
        onClose={handleCloseEditor}
      />
    </>
  );
}