'use client';

import { FC, useState } from 'react'; // <-- 1. Import useState
import { Draft } from '../../../../types';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { X, Users } from 'lucide-react';
import {Button} from '../../../ui/button';
import EditorToolbar from './EditorToolbar';
import CommentSidebar from './CommentSidebar';

interface EditorModalProps {
  draft: Draft | null;
  onClose: () => void;
}

const initialContent = `
  <h2>Acquisition Memo: Project Helios</h2>
  <p>This document outlines the strategic rationale and key findings for the proposed acquisition of <strong>SolarTech Inc.</strong></p>
  <ul>
    <li>Market Analysis</li>
    <li>Financial Projections</li>
    <li>Risk Assessment</li>
  </ul>
`;

const CollaborativeEditorModal: FC<EditorModalProps> = ({ draft, onClose }) => {
  // --- THIS IS THE FIX ---
  // 2. We add a simple state variable whose only job is to trigger re-renders.
  const [_, setForceUpdate] = useState(0);

  const editor = useEditor({
    extensions: [ StarterKit ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-sm sm:prose-base focus:outline-none max-w-none text-slate-300',
      },
    },
    immediatelyRender: false,
    
    // 3. This is the key. Tiptap will call this function EVERY time the editor's
    // content or selection changes. By updating our state, we force React to re-render.
    onUpdate: () => {
      setForceUpdate(Math.random());
    },
  });
  // --- END OF FIX ---

  if (!draft) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col p-4 sm:p-8">
      <div className="w-full max-w-7xl mx-auto flex flex-col h-full">
        {/* Header */}
        <header className="flex-shrink-0 flex justify-between items-center mb-4">
            <div>
              <input defaultValue={draft.title} className="text-2xl font-bold text-white bg-transparent focus:outline-none focus:bg-surface/50 rounded-md px-2"/>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm"><Users size={16} className="mr-2"/>Share</Button>
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