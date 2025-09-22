// UploadSection.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import FileUploader from './FileUploader';
import UploadStatusPanel from './UploadStatusPanel';
import CategoryDropdown from './CategoryDropdown';
import { UploadedFile } from '../../../../types';
import { supabase } from '../../../../lib/supabaseClient';
import { Loader2 } from 'lucide-react';

export default function UploadSection() {
  const [recentUploads, setRecentUploads] = useState<UploadedFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('General');
  const MOCK_PROJECT_ID = '00000000-0000-0000-0000-000000000001';

  const fetchRecentUploads = useCallback(async () => {
    setIsLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setIsLoading(false); return; }

    try {
      const response = await fetch(`http://localhost:8000/api/projects/${MOCK_PROJECT_ID}/vdr/documents`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });

      if (!response.ok) throw new Error("Failed to fetch documents");

      const data = await response.json();

      const adaptedData: UploadedFile[] = data.map((item: any) => ({
        id: item.id,
        name: item.file_name,
        status: item.analysis_status || 'Success',
        category: item.category || 'Uncategorized',
        uploaded_at: item.uploaded_at,
        file_path: item.file_path,
      }));

      setRecentUploads(adaptedData);
    } catch (error) {
      console.error("Error fetching documents:", error);
      setRecentUploads([]);
    } finally {
      setIsLoading(false);
    }
  }, [MOCK_PROJECT_ID]);

  useEffect(() => {
    fetchRecentUploads();
  }, [fetchRecentUploads]);

  const handleFileUpload = async (files: File[]) => {
    setIsUploading(true);
    const file = files[0];
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { alert("Please log in"); setIsUploading(false); return; }

    try {
      console.log("Starting file upload:", file.name, "to category:", selectedCategory);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('project_id', MOCK_PROJECT_ID);
      formData.append('category', selectedCategory);
      const response = await fetch(`http://localhost:8000/api/vdr/documents/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        },
        body: formData
      });


      console.log("Upload response status:", response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Upload successful:', result);
        await fetchRecentUploads();
      } else {
        let errorMessage = "Upload failed";
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorMessage;
        } catch (e) {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Upload error:", error);

      // Safe error message handling
      let errorMessage = "File upload failed";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = String(error.message);
      }

      alert(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadDocument = async (file: UploadedFile) => {
    if (!file.id) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert("Please log in to download files");
        return;
      }

      const response = await fetch(`http://localhost:8000/api/vdr/documents/${file.id}/download`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Download failed with status:", response.status, errorText);
        throw new Error(`Download failed: ${response.status} ${errorText}`);
      }

      // Get filename from content-disposition header or use default
      const contentDisposition = response.headers.get('content-disposition');
      let filename = file.name;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Create blob from response and trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (error) {
      console.error("Download error:", error);

      // Safe error message handling
      let errorMessage = "Failed to download document";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = String(error.message);
      }

      alert(errorMessage);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      <div className="space-y-4">
        {/* Category Dropdown */}
        <CategoryDropdown
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
        <FileUploader onFileUpload={handleFileUpload} isUploading={isUploading} />
      </div>
      <div>
        {isLoading ? (
          <div className="h-full flex justify-center items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <UploadStatusPanel
            recentUploads={recentUploads}
            onDownloadDocument={handleDownloadDocument}
          />
        )}
      </div>
    </div>
  );
}