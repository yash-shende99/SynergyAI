'use client';

import React, { FC, useState, useCallback, useRef, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { X, Users, Save } from 'lucide-react';
import { Button } from '../../../ui/button';
import EditorToolbar from './EditorToolbar';
import CommentSidebar from './CommentSidebar';
import { useReportStore } from '../../../../store/reportStore';

interface EditorModalProps {
  draft: any;
  onClose: () => void;
}

const CollaborativeEditorModal: FC<EditorModalProps> = ({ draft, onClose }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const updateDraftContent = useReportStore((state) => state.updateDraftContent);

  const editor = useEditor({
    extensions: [StarterKit],
    content: draft?.content?.html || '<p>Start writing your report...</p>',
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-sm sm:prose-base focus:outline-none max-w-none text-slate-300 min-h-[500px]',
      },
    },
    immediatelyRender: false, // Add this line to fix SSR
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      handleAutoSave(html);
    },
  });

  const handleAutoSave = useCallback(async (content: string) => {
    if (!draft) return;
    
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    autoSaveTimeoutRef.current = setTimeout(async () => {
      setIsSaving(true);
      try {
        await updateDraftContent(draft.id, {
          html: content,
          lastUpdated: new Date().toISOString()
        });
        setLastSaved(new Date());
      } catch (error) {
        console.error('Failed to auto-save:', error);
      } finally {
        setIsSaving(false);
        autoSaveTimeoutRef.current = null;
      }
    }, 2000);
  }, [draft, updateDraftContent]);

  const handleSave = async () => {
    if (!editor || !draft) return;
    
    setIsSaving(true);
    try {
      await updateDraftContent(draft.id, {
        html: editor.getHTML(),
        lastUpdated: new Date().toISOString()
      });
      setLastSaved(new Date());
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setIsSaving(false);
    }
  };

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
              defaultValue={draft.title} 
              className="text-2xl font-bold text-white bg-transparent focus:outline-none focus:bg-surface/50 rounded-md px-2"
              onBlur={(e) => {
                updateDraftContent(draft.id, { title: e.target.value });
              }}
            />
            {isSaving && <span className="text-sm text-amber-400">Saving...</span>}
            {lastSaved && !isSaving && (
              <span className="text-sm text-green-400">
                Saved {lastSaved.toLocaleTimeString()}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={handleSave} 
              variant="secondary" 
              size="sm"
              disabled={isSaving}
            >
              <Save size={16} className="mr-2"/>
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
            <Button variant="secondary" size="sm">
              <Users size={16} className="mr-2"/>Share
            </Button>
            <Button onClick={onClose} variant="default" size="sm">Done</Button>
          </div>
        </header>

        {/* Main Workspace */}
        <div className="flex-1 flex gap-6 overflow-hidden">
          <div className="flex-1 flex flex-col bg-surface/80 rounded-xl border border-border overflow-hidden">
            <EditorToolbar editor={editor} />
            <div className="flex-1 p-8 overflow-y-auto">
              <EditorContent editor={editor} />
            </div>
          </div>
          <div className="w-80 flex-shrink-0">
            <CommentSidebar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollaborativeEditorModal;