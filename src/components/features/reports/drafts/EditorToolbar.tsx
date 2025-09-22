import { FC, ReactNode } from 'react'; // <-- 1. Import ReactNode
import type { Editor } from '@tiptap/react';
import { Bold, Italic, Strikethrough, Heading2, List, ListOrdered } from 'lucide-react';

interface EditorToolbarProps {
  editor: Editor | null;
}

const EditorToolbar: FC<EditorToolbarProps> = ({ editor }) => {
  if (!editor) return null;

  // --- THIS IS THE FIX ---
  // 2. Define a clear interface for our helper component's props.
  interface ToolbarButtonProps {
    onClick: () => void;
    isActive: boolean;
    children: ReactNode; // The content inside the button (our icon)
  }

  // 3. Apply the interface to the component's props.
  const ToolbarButton: FC<ToolbarButtonProps> = ({ onClick, isActive, children }) => (
    <button
      onClick={onClick}
      className={`p-2 rounded-md transition-colors ${isActive ? 'bg-primary text-white' : 'text-secondary hover:bg-border'}`}
    >
      {children}
    </button>
  );
  // --- END OF FIX ---

  return (
    <div className="p-2 border-b border-border bg-surface/50 flex items-center gap-1">
      <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')}><Bold size={16}/></ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')}><Italic size={16}/></ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')}><Strikethrough size={16}/></ToolbarButton>
      <div className="w-px h-6 bg-border mx-1"></div>
      <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })}><Heading2 size={16}/></ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')}><List size={16}/></ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')}><ListOrdered size={16}/></ToolbarButton>
    </div>
  );
};

export default EditorToolbar;