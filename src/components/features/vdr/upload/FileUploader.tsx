'use client';

import { FC } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, ShieldCheck, Loader2 } from 'lucide-react';
import { Button } from '../../../ui/button';

interface FileUploaderProps {
  onFileUpload: (files: File[]) => void;
  isUploading: boolean;
  selectedCategory?: string;
  projectId?: string; // Add projectId to the interface
}

const FileUploader: FC<FileUploaderProps> = ({ 
  onFileUpload, 
  isUploading, 
  selectedCategory, 
  projectId // Destructure projectId from props
}) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onFileUpload,
    multiple: true,
  });

  return (
    <div className="p-4 rounded-xl border border-border bg-surface/50 h-full flex flex-col">
      <h3 className="font-semibold text-white mb-4">Upload Documents</h3>
      
      {/* Combined selectedCategory and projectId display */}
      {selectedCategory && (
        <div className="mb-4 p-2 bg-primary/10 rounded-lg text-center">
          <span className="text-primary text-sm">
            Uploading to: <strong>{selectedCategory}</strong>
            {projectId && (
              <span className="block text-xs text-secondary mt-1">
                Project: {projectId.substring(0, 8)}...
              </span>
            )}
          </span>
        </div>
      )}
      
      <div {...getRootProps()} className={`flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg text-center transition-colors
        ${isDragActive ? 'border-primary bg-primary/10' : 'border-border bg-background/50 hover:border-primary/50'}`}>
        <input {...getInputProps()} />
        {isUploading ? (
          <>
            <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
            <h4 className="font-semibold text-white">Uploading...</h4>
            <p className="text-sm text-secondary mt-1">Please wait while your file is processed.</p>
          </>
        ) : (
          <>
            <UploadCloud className="h-12 w-12 text-secondary mb-4" />
            <h4 className="font-semibold text-white">Drag & drop files here</h4>
            <p className="text-sm text-secondary mt-1">or click to browse</p>
            <p className="text-xs text-secondary mt-4">Max file size: 500MB. Supports folders.</p>
          </>
        )}
      </div>
      
      <div className="mt-4 p-3 rounded-lg bg-background/50 text-center">
        <div className="flex items-center justify-center gap-3 text-sm text-green-400">
          <ShieldCheck size={16} />
          <span>End-to-end encrypted & Secure</span>
        </div>
      </div>
    </div>
  );
};

export default FileUploader;