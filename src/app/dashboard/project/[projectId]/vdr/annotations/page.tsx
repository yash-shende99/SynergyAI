// app/dashboard/project/[projectId]/vdr/annotations/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { AnnotatedDocument, AnnotationThread } from '../../../../../../types';
import { Loader2 } from 'lucide-react';
import { supabase } from '../../../../../../lib/supabaseClient';
import AnnotationsSection from '../../../../../../components/features/vdr/annotations/AnnotationsSection';

export default function VDRAnnotationsPage() {
  const [documents, setDocuments] = useState<AnnotatedDocument[]>([]);
  const [activeDocument, setActiveDocument] = useState<AnnotatedDocument | null>(null);
  const [threads, setThreads] = useState<AnnotationThread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams();
  const projectId = params.projectId as string;

  // Fetch annotation threads for the active document
  const fetchThreads = useCallback(async () => {
    if (!activeDocument) {
      setThreads([]);
      return;
    }
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`http://localhost:8000/api/documents/${activeDocument.id}/annotations`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setThreads(data);
      } else {
        setThreads([]);
      }
    } catch (error) { 
      console.error("Error fetching threads:", error);
      setThreads([]);
    }
  }, [activeDocument]);

  // Fetch annotated documents on page load
  useEffect(() => {
    async function fetchAnnotatedDocuments() {
      if (!projectId) return;
      
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const response = await fetch(`http://localhost:8000/api/projects/${projectId}/vdr/annotated_documents`, {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setDocuments(data);
          if (data.length > 0) {
            setActiveDocument(data[0]);
          }
        }
      } catch (error) { 
        console.error("Error fetching documents:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAnnotatedDocuments();
  }, [projectId]);

  // Fetch threads when active document changes
  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Document Annotations</h1>
        <p className="text-secondary">
          Review and discuss document highlights with your team
        </p>
      </div>
      
      <AnnotationsSection 
        documents={documents}
        activeDocument={activeDocument}
        onSelectDocument={setActiveDocument}
        threads={threads}
        refreshThreads={fetchThreads}
      />
    </div>
  );
}