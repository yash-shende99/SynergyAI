'use client';

import React, { FC, useState, useCallback, useRef, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { X, Users, Save, MessageSquare, RotateCcw } from 'lucide-react';
import { Button } from '../../../ui/button';
import EditorToolbar from './EditorToolbar';
import CommentSidebar from './CommentSidebar';
import { useReportStore } from '../../../../store/reportStore';
import { useCommentsStore } from '../../../../store/commentsStore';
import { useVersionHistoryStore } from '../../../../store/versionHistoryStore';

interface EditorModalProps {
  draft: any;
  onClose: () => void;
}

const CollaborativeEditorModal: FC<EditorModalProps> = ({ draft, onClose }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [title, setTitle] = useState(draft?.title || 'Untitled Draft');
  const [showComments, setShowComments] = useState(true);
  const [restoreMessage, setRestoreMessage] = useState<string | null>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { updateDraft, updateDraftContent } = useReportStore();
  const { getUnresolvedCount } = useCommentsStore();
  const versionHistoryStore = useVersionHistoryStore();

  const editor = useEditor({
    extensions: [StarterKit],
    content: draft?.content?.html || '<p>Start writing your report...</p>',
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-sm sm:prose-base focus:outline-none max-w-none text-slate-300 min-h-[500px]',
      },
    },
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      handleAutoSave(html);
    },
  });

  // ✅ FIX: Define handleAutoSave first to avoid circular dependency
  const handleAutoSave = useCallback(async (content: string) => {
    if (!draft || !editor) return;
    
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    autoSaveTimeoutRef.current = setTimeout(async () => {
      setIsSaving(true);
      try {
        // Save to report store
        await updateDraftContent(draft.id, {
          html: content,
          lastUpdated: new Date().toISOString()
        });
        
        // Save to version history (only if content actually changed)
        const currentContent = editor.getHTML();
        if (currentContent !== content) {
          versionHistoryStore.saveVersion(
            draft.id,
            content,
            'current-user-id', // Get from your auth
            'You'
          );
        }
        
        setLastSaved(new Date());
      } catch (error) {
        console.error('Failed to auto-save:', error);
      } finally {
        setIsSaving(false);
        autoSaveTimeoutRef.current = null;
      }
    }, 2000);
  }, [draft, editor, updateDraftContent, versionHistoryStore]);

  // ✅ FIX: Now handleRestoreVersion can safely use handleAutoSave
  const handleRestoreVersion = useCallback((content: string) => {
    if (!editor) return;
    
    // Update the editor content
    editor.commands.setContent(content);
    
    // Show success message
    setRestoreMessage('Version restored successfully!');
    
    // Auto-save the restored version
    handleAutoSave(content);
    
    // Clear message after 3 seconds
    setTimeout(() => {
      setRestoreMessage(null);
    }, 3000);
  }, [editor, handleAutoSave]);

  const unresolvedComments = getUnresolvedCount(draft?.id || 'current-draft');

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (draft?.id) {
      updateDraft(draft.id, { title: newTitle });
    }
  };

  const handleTitleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const newTitle = e.target.value.trim() || 'Untitled Draft';
    handleTitleChange(newTitle);
  };

  const handleTitleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  const handleSave = async () => {
    if (!editor || !draft) return;
    
    setIsSaving(true);
    try {
      const content = editor.getHTML();
      await updateDraftContent(draft.id, {
        html: content,
        lastUpdated: new Date().toISOString()
      });
      
      // Force save to version history
      versionHistoryStore.saveVersion(
        draft.id,
        content,
        'current-user-id',
        'You',
        ['Manual save']
      );
      
      setLastSaved(new Date());
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Initialize version history when draft loads
  useEffect(() => {
    if (draft?.id && editor) {
      versionHistoryStore.initializeDocument(
        draft.id, 
        draft?.content?.html || '<p>Start writing your report...</p>',
        'current-user-id', // Get from your auth
        'You'
      );
    }
  }, [draft?.id, draft?.content?.html, editor, versionHistoryStore]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  if (!draft) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col p-4 sm:p-8">
      <div className="w-full max-w-7xl mx-auto flex flex-col h-full">
        {/* Header */}
        <header className="flex-shrink-0 flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <input 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyPress={handleTitleKeyPress}
              className="text-2xl font-bold text-white bg-transparent focus:outline-none focus:bg-surface/50 rounded-md px-2 border border-transparent hover:border-border focus:border-primary transition-colors"
            />
            {isSaving && <span className="text-sm text-amber-400">Saving...</span>}
            {lastSaved && !isSaving && (
              <span className="text-sm text-green-400">
                Saved {lastSaved.toLocaleTimeString()}
              </span>
            )}
            {restoreMessage && (
              <span className="text-sm text-blue-400 flex items-center gap-1">
                <RotateCcw size={14} />
                {restoreMessage}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={() => setShowComments(!showComments)}
              variant="secondary" 
              size="sm"
            >
              <MessageSquare size={16} className="mr-2"/>
              Comments
              {unresolvedComments > 0 && (
                <span className="ml-2 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unresolvedComments}
                </span>
              )}
            </Button>
            <Button 
              onClick={handleSave} 
              variant="secondary" 
              size="sm"
              disabled={isSaving}
            >
              <Save size={16} className="mr-2"/>
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
            <Button onClick={onClose} variant="default" size="sm">Done</Button>
          </div>
        </header>

        {/* Main Workspace */}
        <div className="flex-1 flex gap-6 overflow-hidden">
          {/* Editor Area */}
          <div className="flex-1 flex flex-col bg-surface/80 rounded-xl border border-border overflow-hidden">
            <EditorToolbar editor={editor} />
            <div className="flex-1 p-8 overflow-y-auto">
              {editor && <EditorContent editor={editor} />}
            </div>
          </div>
          
          {/* Comments Sidebar - Conditionally rendered */}
          {showComments && (
            <div className="w-96 flex-shrink-0">
              <CommentSidebar 
                documentId={draft.id}
                projectId={draft.projectId}
                onRestoreVersion={handleRestoreVersion} // ✅ Pass the restore handler
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollaborativeEditorModal;