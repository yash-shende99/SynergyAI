'use client';

import { useState, useEffect } from 'react';
import FolderTreeView from './FolderTreeView';
import DocumentList from './DocumentList';
import DocumentPreview from './DocumentPreview';
import { DocumentFolderKey, Document as DocumentType, Category } from '../../../../types';
import { supabase } from '../../../../lib/supabaseClient';
import { Loader2 } from 'lucide-react';


export default function CategoriesSection() {
  const [selectedFolder, setSelectedFolder] = useState<DocumentFolderKey>('General'); // Updated type
  const [selectedDocument, setSelectedDocument] = useState<DocumentType | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [documents, setDocuments] = useState<DocumentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const MOCK_PROJECT_ID = '00000000-0000-0000-0000-000000000001';
  
  const normalizeCategoryName = (category: string): string => {
  if (!category || category === 'Uncategorized') return 'Uncategorized';
  return category;
};

  const fetchCategories = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`http://localhost:8000/api/projects/${MOCK_PROJECT_ID}/vdr/categories`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const getUploaderName = (userId: string, userName?: string) => {
    if (userName) return userName;
    // Fallback to user ID if name not available
    return `User ${userId?.substring(0, 8)}...`;
  };

  // Fetch documents by category
  const fetchDocuments = async (category: string) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    // Normalize the category name for the API call
    let apiCategory = category;
    if (category === 'Uncategorized') {
      apiCategory = 'null'; // Send 'null' for uncategorized documents
    }

    console.log('Fetching documents for category:', apiCategory);
    
    const response = await fetch(
      `http://localhost:8000/api/projects/${MOCK_PROJECT_ID}/vdr/documents/category/${encodeURIComponent(apiCategory)}`,
      {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      }
    );

    if (response.ok) {
      const data = await response.json();
      console.log(`Documents for ${category}:`, data);
      
      const formattedDocs: DocumentType[] = data.map((doc: any) => ({
        id: doc.id,
        name: doc.file_name,
        uploader: getUploaderName(doc.uploaded_by_user_id),
        date: doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : 'Unknown date',
        file_path: doc.file_path || '',
        category: doc.category || 'Uncategorized',
        analysis_status: doc.analysis_status || 'Pending',
        uploaded_by_user_id: doc.uploaded_by_user_id,
        project_id: doc.project_id
      }));
      
      setDocuments(formattedDocs);
      setSelectedDocument(formattedDocs.length > 0 ? formattedDocs[0] : null);
    }
  } catch (error) {
    console.error('Error fetching documents:', error);
  } finally {
    setIsLoading(false);
  }
};

useEffect(() => {
  fetchCategories().then(() => {
    console.log('Categories loaded:', categories);
  });
}, []);

useEffect(() => {
  if (selectedFolder) {
    console.log('Fetching documents for category:', selectedFolder);
    setIsLoading(true);
    fetchDocuments(selectedFolder);
  }
}, [selectedFolder]);

  const handleDocumentDelete = async (documentId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert("Please log in to delete files");
        return;
      }

      const response = await fetch(`http://localhost:8000/api/vdr/documents/${documentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });

      if (response.ok) {
        alert("Document deleted successfully");
        // Refresh the documents list
        fetchDocuments(selectedFolder);
        fetchCategories(); // Refresh category counts
      } else {
        const error = await response.json();
        alert(`Delete failed: ${error.detail}`);
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      alert("Failed to delete document");
    }
  };
  const handleDownloadDocument = async (document: DocumentType) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert("Please log in to download files");
        return;
      }

      const response = await fetch(`http://localhost:8000/api/vdr/documents/${document.id}/download`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });

      if (response.ok) {
        const blob = await response.blob();

        // Use window.document instead of just document
        if (typeof window !== 'undefined' && window.document) {
          const url = window.URL.createObjectURL(blob);
          const a = window.document.createElement('a'); // Use window.document
          a.style.display = 'none';
          a.href = url;
          a.download = document.name;
          window.document.body.appendChild(a); // Use window.document
          a.click();
          window.URL.revokeObjectURL(url);
          window.document.body.removeChild(a); // Use window.document
        }
      } else {
        alert("Download failed");
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      alert("Failed to download document");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-full">
      <div className="md:col-span-3 lg:col-span-2">
        <FolderTreeView
          folders={categories}
          selectedFolder={selectedFolder}
          onSelectFolder={setSelectedFolder}
        />
      </div>
      <div className="md:col-span-4 lg:col-span-5">
        <DocumentList
          documents={documents}
          selectedDocument={selectedDocument}
          onSelectDocument={setSelectedDocument}
          onDeleteDocument={handleDocumentDelete}
          onDownloadDocument={handleDownloadDocument}
        />
      </div>
      <div className="md:col-span-5 lg:col-span-5">
        <DocumentPreview document={selectedDocument} />
      </div>
    </div>
  );
}