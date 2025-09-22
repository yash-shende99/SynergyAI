// UploadedFileItem.tsx
import { FC } from 'react';
import { FileText, CheckCircle, Clock, XCircle, Download } from 'lucide-react';
import { UploadedFile } from '../../../../types';
import { Button } from '../../../ui/button';

interface UploadedFileItemProps {
  file: UploadedFile;
  onDownload?: (file: UploadedFile) => void;
}

const getStatusIcon = (status: UploadedFile['status']) => {
  switch (status) {
    case 'Success':
      return <CheckCircle size={16} className="text-green-500" />;
    case 'Processing':
      return <Clock size={16} className="text-amber-500 animate-spin" />;
    case 'Failed':
      return <XCircle size={16} className="text-red-500" />;
    case 'Pending':
      return <Clock size={16} className="text-amber-500 animate-spin" />;
    default:
      return <Clock size={16} className="text-amber-500 animate-spin" />;
  }
};
const UploadedFileItem: FC<UploadedFileItemProps> = ({ file, onDownload }) => {
  const canDownload = file.status === 'Success';

  const handleDownload = () => {
    if (canDownload && onDownload) {
      onDownload(file);
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50 hover:bg-background/70 transition-colors">
      <FileText size={20} className="text-secondary flex-shrink-0"/>
      <div className="flex-1 overflow-hidden">
        <p className="font-medium text-white truncate">{file.name}</p>
        <p className="text-xs text-secondary">Category: <span className="font-semibold text-primary/80">{file.category}</span></p>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 text-sm">
          {getStatusIcon(file.status)}
          <span className="text-secondary">{file.status}</span>
        </div>
        {canDownload && onDownload && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="ml-2 hover:text-primary transition-colors"
            title="Download document"
          >
            <Download size={16} />
          </Button>
        )}
      </div>
    </div>
  );
};

export default UploadedFileItem;