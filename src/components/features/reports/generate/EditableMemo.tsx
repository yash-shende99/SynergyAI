'use client';

import { FC, useState } from 'react';
import { Button } from '../../../ui/button';
import { Edit, Check, X, Save, FileText, History } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface EditableMemoProps {
  initialContent: string;
  sectionTitle?: string;
}

const EditableMemo: FC<EditableMemoProps> = ({ 
  initialContent, 
  sectionTitle = "Executive Summary" 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(initialContent);
  const [tempContent, setTempContent] = useState(content);
  const [versionHistory, setVersionHistory] = useState([initialContent]);

  const handleSave = () => {
    setContent(tempContent);
    setVersionHistory(prev => [...prev, tempContent]);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempContent(content);
    setIsEditing(false);
  };

  const handleRestoreVersion = (versionContent: string) => {
    setContent(versionContent);
    setTempContent(versionContent);
    setIsEditing(false);
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
              <ReactMarkdown
                components={{
                  // Customize markdown components if needed
                  p: ({children}) => <p className="text-secondary leading-relaxed mb-4">{children}</p>,
                  strong: ({children}) => <strong className="text-white font-semibold">{children}</strong>,
                  h1: ({children}) => <h1 className="text-2xl font-bold text-white mb-4">{children}</h1>,
                  h2: ({children}) => <h2 className="text-xl font-bold text-white mb-3">{children}</h2>,
                  h3: ({children}) => <h3 className="text-lg font-bold text-white mb-2">{children}</h3>,
                  ul: ({children}) => <ul className="list-disc list-inside mb-4 text-secondary">{children}</ul>,
                  ol: ({children}) => <ol className="list-decimal list-inside mb-4 text-secondary">{children}</ol>,
                  li: ({children}) => <li className="mb-1">{children}</li>,
                }}
              >
                {content}
              </ReactMarkdown>
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