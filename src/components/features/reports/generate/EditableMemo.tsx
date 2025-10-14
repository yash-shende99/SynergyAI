'use client';

import { FC, useState } from 'react';
import { Button } from '../../../ui/button';
import { Edit, Check, X, Save, FileText, History } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface EditableMemoProps {
  initialContent: string;
  sectionTitle?: string;
}

// Move sanitizeContent outside the component to avoid hoisting issues
const sanitizeContent = (content: any): string => {
  if (!content) return 'Content not available.';
  
  // If it's already a string, clean it
  if (typeof content === 'string') {
    // Remove [object Object] artifacts and clean up markdown
    return content
      .replace(/\[object Object\]/g, '')
      .replace(/\*\*\[object Object\]\*\*/g, '')
      .replace(/\[object Object\]\s*/g, '')
      .trim();
  }
  
  // If it's an object, try to extract meaningful content
  if (typeof content === 'object') {
    // Try to find text properties
    const textContent = content.text || content.content || content.value || '';
    if (textContent) return String(textContent);
    
    // Last resort: stringify and clean
    return JSON.stringify(content)
      .replace(/\[object Object\]/g, '')
      .replace(/"\s*:\s*"/g, ': ')
      .replace(/[{}"\\]/g, '')
      .trim();
  }
  
  return String(content || '');
};

const EditableMemo: FC<EditableMemoProps> = ({ 
  initialContent, 
  sectionTitle = "Executive Summary" 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState<string>(() => {
    // Ensure content is always a clean string
    return sanitizeContent(initialContent);
  });
  const [tempContent, setTempContent] = useState(content);
  const [versionHistory, setVersionHistory] = useState<string[]>([content]);

  // Function to safely get content
  const getSafeContent = (content: string): string => {
    const safeContent = sanitizeContent(content);
    return safeContent || 'Analysis content is being prepared...';
  };

  const handleSave = () => {
    const safeContent = getSafeContent(tempContent);
    setContent(safeContent);
    setVersionHistory(prev => [...prev, safeContent]);
    setIsEditing(false); // Fixed: was setIsLoading, should be setIsEditing
  };

  const handleCancel = () => {
    setTempContent(content);
    setIsEditing(false);
  };

  const handleRestoreVersion = (versionContent: string) => {
    const safeContent = getSafeContent(versionContent);
    setContent(safeContent);
    setTempContent(safeContent);
    setIsEditing(false);
  };

  // Function to safely render children
  const safeChildren = (children: any): string => {
    if (typeof children === 'string') return children;
    if (Array.isArray(children)) {
      return children.map(child => safeChildren(child)).join('');
    }
    if (children?.props?.children) {
      return safeChildren(children.props.children);
    }
    return String(children || '');
  };

  // Safe markdown component that handles object children
  const SafeMarkdown: FC<{ content: string }> = ({ content }) => {
    const safeContent = getSafeContent(content);
    
    return (
      <ReactMarkdown
        components={{
          p: ({ children }) => (
            <p className="text-secondary leading-relaxed mb-4">
              {safeChildren(children)}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="text-white font-semibold">
              {safeChildren(children)}
            </strong>
          ),
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold text-white mb-4">
              {safeChildren(children)}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-bold text-white mb-3">
              {safeChildren(children)}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-bold text-white mb-2">
              {safeChildren(children)}
            </h3>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside mb-4 text-secondary">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside mb-4 text-secondary">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="mb-1">
              {safeChildren(children)}
            </li>
          ),
          code: ({ children }) => (
            <code className="bg-gray-800 px-1 py-0.5 rounded text-sm">
              {safeChildren(children)}
            </code>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary pl-4 italic my-4">
              {safeChildren(children)}
            </blockquote>
          ),
        }}
      >
        {safeContent}
      </ReactMarkdown>
    );
  };

  return (
    <div className="p-6 rounded-xl border border-border bg-surface/80 h-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <FileText size={20} className="text-primary" />
          <div>
            <h2 className="text-xl font-semibold text-white">{sectionTitle}</h2>
            <p className="text-sm text-secondary">AI-generated analysis - edit as needed</p>
          </div>
        </div>
        
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Button 
              onClick={handleCancel} 
              variant="secondary" 
              size="sm"
              className="gap-2"
            >
              <X size={16} />
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              variant="default" 
              size="sm"
              className="gap-2"
            >
              <Check size={16} />
              Save Changes
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button 
              onClick={() => {
                setTempContent(content);
                setIsEditing(true);
              }} 
              variant="ghost" 
              size="sm"
              className="gap-2"
            >
              <Edit size={16} />
              Edit Section
            </Button>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="mb-6">
        {isEditing ? (
          <div className="space-y-4">
            <textarea 
              value={tempContent} 
              onChange={(e) => setTempContent(e.target.value)} 
              className="w-full h-64 p-4 bg-background/50 border border-primary/30 rounded-lg text-white placeholder-gray-400 focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none"
              placeholder="Write your analysis here..."
            />
            <div className="flex justify-between items-center text-sm text-secondary">
              <span>{tempContent.length} characters</span>
              <span>Markdown supported</span>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-lg bg-background/30 border border-border">
            <div className="prose prose-invert max-w-none">
              <SafeMarkdown content={content} />
            </div>
          </div>
        )}
      </div>

      {/* Version History */}
      {!isEditing && versionHistory.length > 1 && (
        <div className="border-t border-border pt-4">
          <details className="group">
            <summary className="flex items-center gap-2 text-sm text-secondary hover:text-white cursor-pointer list-none">
              <History size={16} />
              <span>Version History ({versionHistory.length})</span>
            </summary>
            <div className="mt-3 space-y-2 max-h-32 overflow-y-auto">
              {versionHistory.slice().reverse().map((version, index) => (
                <button
                  key={index}
                  onClick={() => handleRestoreVersion(version)}
                  className="w-full text-left p-2 text-xs rounded hover:bg-surface/50 transition-colors text-secondary hover:text-white"
                >
                  <div className="flex justify-between">
                    <span>Version {versionHistory.length - index}</span>
                    <span>{version.length} chars</span>
                  </div>
                </button>
              ))}
            </div>
          </details>
        </div>
      )}
    </div>
  );
};

export default EditableMemo;