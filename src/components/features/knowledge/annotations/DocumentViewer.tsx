// components/features/vdr/annotations/DocumentViewer.tsx
'use client';

import { FC, useState, useRef, useEffect } from 'react';
import { AnnotatedDocument, AnnotationThread } from '../../../../types';
import { Highlighter, Plus, Loader2 } from 'lucide-react';
import { supabase } from '../../../../lib/supabaseClient';

interface DocumentViewerProps {
  document: AnnotatedDocument | null;
  threads: AnnotationThread[];
  activeThreadId: string | null;
  onSelectThread: (id: string) => void;
  onRefreshThreads: () => void;
}

const DocumentViewer: FC<DocumentViewerProps> = ({ 
  document: selectedDocument, // Renamed to avoid conflict with global document
  threads, 
  activeThreadId, 
  onSelectThread,
  onRefreshThreads 
}) => {
  const [isSelectingText, setIsSelectingText] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [selectionPosition, setSelectionPosition] = useState({ x: 0, y: 0 });
  const [isCreatingAnnotation, setIsCreatingAnnotation] = useState(false);
  const documentRef = useRef<HTMLDivElement>(null);

  const handleTextSelection = (e: React.MouseEvent) => {
    if (!selectedDocument || !isSelectingText) return;
    
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      setSelectedText(selection.toString().trim());
      
      // Get position for toolbar placement
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      if (documentRef.current) {
        const containerRect = documentRef.current.getBoundingClientRect();
        setSelectionPosition({
          x: rect.left - containerRect.left + rect.width / 2,
          y: rect.top - containerRect.top - 50
        });
      }
    } else {
      setSelectedText('');
    }
  };

// components/features/vdr/annotations/DocumentViewer.tsx
const createAnnotation = async () => {
  if (!selectedDocument || !selectedText) return;
  
  setIsCreatingAnnotation(true);
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Not authenticated");

    const comment = prompt("Add a comment for this highlighted text:", "");
    if (!comment) {
      cancelSelection();
      return;
    }

    // Only send required fields, omit optional ones that might not exist
    const annotationData = {
      document_id: selectedDocument.id,
      highlighted_text: selectedText,
      comment_text: comment
      // Remove page_number, x_position, y_position for now
    };

    const response = await fetch('http://localhost:8000/api/annotations/create', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify(annotationData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to create annotation");
    }
    
    // Refresh threads
    onRefreshThreads();
    cancelSelection();
    
  } catch (error) {
    console.error("Error creating annotation:", error);
    alert(`Failed to create annotation: ${(error as Error).message}`);
  } finally {
    setIsCreatingAnnotation(false);
  }
};

  const cancelSelection = () => {
    setIsSelectingText(false);
    setSelectedText('');
    // Clear any selection
    window.getSelection()?.removeAllRanges();
  };

  // Close selection toolbar when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isSelectingText && selectedText && documentRef.current && 
          !documentRef.current.contains(e.target as Node)) {
        cancelSelection();
      }
    };

    // Use the global document object safely
    if (typeof document !== 'undefined') {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isSelectingText, selectedText]);

  if (!selectedDocument) {
    return (
      <div className="p-4 rounded-xl border border-border bg-surface/50 h-full flex items-center justify-center">
        <p className="text-secondary">Select a document to view annotations</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-surface/50 h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-white">{selectedDocument.name}</h3>
          <p className="text-sm text-secondary">
            {threads.length} annotation{threads.length !== 1 ? 's' : ''}
            {threads.some(t => !t.resolved) && ` • ${threads.filter(t => !t.resolved).length} unresolved`}
          </p>
        </div>
        <button
          onClick={() => {
            if (isSelectingText) {
              cancelSelection();
            } else {
              setIsSelectingText(true);
            }
          }}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            isSelectingText 
              ? 'bg-primary text-white' 
              : 'bg-surface text-secondary hover:text-white'
          }`}
        >
          <Highlighter size={16} />
          {isSelectingText ? 'Cancel Selection' : 'Highlight Text'}
        </button>
      </div>

      {/* Document Content */}
      <div 
        ref={documentRef}
        className="flex-1 p-6 bg-background/50 overflow-y-auto relative"
        onMouseUp={isSelectingText ? handleTextSelection : undefined}
      >
        {/* Selection Toolbar */}
        {isSelectingText && selectedText && (
          <div 
            className="fixed bg-surface border border-border rounded-lg shadow-lg p-2 flex items-center gap-2 z-50"
            style={{
              left: selectionPosition.x,
              top: selectionPosition.y,
              transform: 'translateX(-50%)'
            }}
          >
            <button
              onClick={createAnnotation}
              disabled={isCreatingAnnotation}
              className="flex items-center gap-2 px-3 py-1 bg-primary text-white rounded text-sm hover:bg-primary/90 disabled:opacity-50"
            >
              {isCreatingAnnotation ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Plus size={14} />
              )}
              Add Annotation
            </button>
            <span className="text-sm text-secondary max-w-xs truncate">
              &ldquo;{selectedText.slice(0, 50)}{selectedText.length > 50 ? '...' : ''}&rdquo;
            </span>
          </div>
        )}

        {/* Mock Document Content with Interactive Highlights */}
        <div className="max-w-4xl mx-auto space-y-6 text-slate-300 leading-relaxed">
          <section>
            <h4 className="text-lg font-semibold text-white mb-3">Agreement Terms</h4>
            <p>
              This Agreement is made and entered into as of the Effective Date by and between the parties.{' '}
              {threads[0] && (
                <button
                  onClick={() => onSelectThread(threads[0].id)}
                  className={`annotation-highlight px-1 mx-1 rounded transition-colors ${
                    activeThreadId === threads[0].id 
                      ? 'bg-amber-500/60 text-white' 
                      : 'bg-amber-500/30 hover:bg-amber-500/40'
                  }`}
                >
                  {threads[0].highlightedText}
                </button>
              )}{' '}
              unless terminated earlier in accordance with Section 8.2.
            </p>
          </section>
          
          <section>
            <h4 className="text-lg font-semibold text-white mb-3">Change of Control</h4>
            <p>
              Upon a change of control, the acquirer must provide written notice within thirty (30) days.{' '}
              {threads[1] && (
                <button
                  onClick={() => onSelectThread(threads[1].id)}
                  className={`annotation-highlight px-1 mx-1 rounded transition-colors ${
                    activeThreadId === threads[1].id 
                      ? 'bg-red-500/60 text-white' 
                      : 'bg-red-500/30 hover:bg-red-500/40'
                  }`}
                >
                  {threads[1].highlightedText}
                </button>
              )}
            </p>
          </section>

          <section>
            <h4 className="text-lg font-semibold text-white mb-3">Financial Obligations</h4>
            <p>
              Financial obligations include quarterly reporting and audit rights.{' '}
              {threads[2] && (
                <button
                  onClick={() => onSelectThread(threads[2].id)}
                  className={`annotation-highlight px-1 mx-1 rounded transition-colors ${
                    activeThreadId === threads[2].id 
                      ? 'bg-blue-500/60 text-white' 
                      : 'bg-blue-500/30 hover:bg-blue-500/40'
                  }`}
                >
                  {threads[2].highlightedText}
                </button>
              )}{' '}
              and delivered within 45 days of quarter end. Late submissions may incur penalties as specified in Exhibit C.
            </p>
          </section>

          <section>
            <h4 className="text-lg font-semibold text-white mb-3">Intellectual Property</h4>
            <p>
              All intellectual property developed during the term remains the property of the developing party, except where jointly developed.{' '}
              {threads[3] && (
                <button
                  onClick={() => onSelectThread(threads[3].id)}
                  className={`annotation-highlight px-1 mx-1 rounded transition-colors ${
                    activeThreadId === threads[3].id 
                      ? 'bg-green-500/60 text-white' 
                      : 'bg-green-500/30 hover:bg-green-500/40'
                  }`}
                >
                  {threads[3].highlightedText}
                </button>
              )}{' '}
              with revenue sharing as outlined in Schedule 2.
            </p>
          </section>

          {/* Fallback content if no threads exist yet */}
          {threads.length === 0 && (
            <section>
              <h4 className="text-lg font-semibold text-white mb-3">Sample Document Content</h4>
              <p className="text-secondary italic">
                This is a sample document. Highlight text and create annotations to start discussions with your team.
                The actual document content would be displayed here based on your uploaded files.
              </p>
              <p className="mt-4">
                To create an annotation:
              </p>
              <ol className="list-decimal list-inside mt-2 space-y-1 text-sm text-secondary">
                <li>Click the &ldquo;Highlight Text&rdquo; button above</li>
                <li>Select text in this document</li>
                <li>Add your comment in the prompt</li>
                <li>Your annotation will appear as highlighted text</li>
              </ol>
            </section>
          )}
        </div>

        {/* Instructions */}
        {isSelectingText && (
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-surface border border-border rounded-lg p-3 text-sm text-secondary z-40">
            Select text to create an annotation. Click outside to cancel.
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentViewer;