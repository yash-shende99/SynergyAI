// UploadStatusPanel.tsx
import { FC } from 'react';
import UploadedFileItem from './UploadedFileItem';
import { UploadedFile } from '../../../../types';

interface UploadStatusPanelProps {
  recentUploads: UploadedFile[];
  onDownloadDocument?: (file: UploadedFile) => void;
}

const UploadStatusPanel: FC<UploadStatusPanelProps> = ({ recentUploads, onDownloadDocument }) => {
  return (
    <div className="p-4 rounded-xl border border-border bg-surface/50 h-full">
      <h3 className="font-semibold text-white mb-4">Recent Uploads</h3>
      {recentUploads.length > 0 ? (
        <div className="space-y-2">
          {recentUploads.map((file, index) => (
            <UploadedFileItem 
              key={index} 
              file={file} 
              onDownload={onDownloadDocument}
            />
          ))}
        </div>
      ) : (
        <div className="text-center text-secondary pt-16">
            <p className="font-semibold">No recent uploads.</p>
            <p className="text-sm mt-1">Drag a file to the panel on the left to get started.</p>
        </div>
      )}
    </div>
  );
};

export default UploadStatusPanel;