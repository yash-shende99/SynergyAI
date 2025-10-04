'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import DraftsHeader from './DraftsHeader';
import DraftsTable from './DraftsTable';
import DraftsGrid from './DraftsGrid';
import CollaborativeEditorModal from './CollaborativeEditorModal';
import { useReportStore } from '../../../../store/reportStore';
import { Draft } from '../../../../types';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function DraftsSection() {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [editingDraft, setEditingDraft] = useState<Draft | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams();
  const projectId = params.projectId as string;

  // Get store state and actions
  const { drafts, addDraft, deleteDraft, duplicateDraft, getDraftsByProject, fetchProjectDrafts } = useReportStore();
  
  // Filter drafts for current project
  const projectDrafts = getDraftsByProject(projectId);

  // Load drafts on component mount
  useEffect(() => {
    const loadDrafts = async () => {
      setIsLoading(true);
      try {
        await fetchProjectDrafts(projectId);
      } catch (error) {
        console.error('Error loading drafts:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDrafts();
  }, [projectId, fetchProjectDrafts]);

  const handleOpenEditor = (draft: Draft) => setEditingDraft(draft);
  const handleCloseEditor = () => setEditingDraft(null);
  
  const handleNewDraft = () => {
    const newDraftData = {
      title: 'Untitled Draft', 
      createdBy: { 
        name: 'You', 
        avatarUrl: '' 
      }, 
      status: 'Draft' as const,
      projectId: projectId
    };
    
    addDraft(newDraftData);
    
    // Find the newly created draft to open it
    const newDraft = useReportStore.getState().drafts[0];
    setEditingDraft(newDraft);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <DraftsHeader 
          viewMode={viewMode}
          onViewChange={setViewMode}
          onNewDraft={handleNewDraft}
        />
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-white">Loading drafts...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <DraftsHeader 
          viewMode={viewMode}
          onViewChange={setViewMode}
          onNewDraft={handleNewDraft}
        />
        
        {projectDrafts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-secondary mb-4">No drafts found for this project.</div>
            <Button onClick={handleNewDraft} variant="default">
              Create Your First Draft
            </Button>
          </div>
        ) : viewMode === 'table' ? (
          <DraftsTable 
            drafts={projectDrafts}
            onOpen={handleOpenEditor}
            onDelete={deleteDraft}
            onDuplicate={duplicateDraft}
          />
        ) : (
          <DraftsGrid 
            drafts={projectDrafts}
            onOpen={handleOpenEditor}
            onDelete={deleteDraft}
            onDuplicate={duplicateDraft}
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