'use client';

import { FC } from 'react';
import Modal from '../../../ui/Modal';
import { CheckCircle, Clock, Download, AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '../../../ui/button';
import { ExportService } from '../../../../utils/exportUtils';

interface ExportProgressModalProps {
  state: 'idle' | 'exporting' | 'complete' | 'error';
  progress: number;
  onClose: () => void;
  onRetry?: () => void;
  error?: string;
  fileName?: string;
}

const ExportProgressModal: FC<ExportProgressModalProps> = ({ 
  state, 
  progress, 
  onClose, 
  onRetry, 
  error,
  fileName 
}) => {
  if (state === 'idle') return null;

  const handleDownloadAgain = () => {
    if (fileName) {
      // In a real implementation, you would re-generate or store the file
      // For now, we'll just trigger a new export
      onRetry?.();
    }
  };

  const getTitle = () => {
    switch (state) {
      case 'exporting': return 'Exporting Reports...';
      case 'complete': return 'Export Complete!';
      case 'error': return 'Export Failed';
      default: return 'Export';
    }
  };

  const getDescription = () => {
    switch (state) {
      case 'exporting': return 'Your documents are being generated and compiled...';
      case 'complete': return `Your ${fileName} has been downloaded.`;
      case 'error': return error || 'An error occurred during export.';
      default: return '';
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={getTitle()}>
      <div className="text-center space-y-4">
        {/* Icons */}
        {state === 'exporting' && (
          <Clock size={48} className="mx-auto text-primary animate-spin"/>
        )}
        {state === 'complete' && (
          <CheckCircle size={48} className="mx-auto text-green-500"/>
        )}
        {state === 'error' && (
          <AlertCircle size={48} className="mx-auto text-red-500"/>
        )}

        {/* Progress Bar */}
        {state === 'exporting' && (
          <>
            <div className="w-full bg-border rounded-full h-2.5">
              <div 
                className="bg-primary h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm font-semibold text-white">{Math.round(progress)}%</p>
          </>
        )}

        {/* Messages */}
        <p className={`text-sm ${
          state === 'error' ? 'text-red-400' : 'text-secondary'
        }`}>
          {getDescription()}
        </p>

        {/* Actions */}
        <div className="flex gap-2 justify-center pt-2">
          {state === 'complete' && (
            <>
              <Button 
                variant="default" 
                size="sm"
                onClick={handleDownloadAgain}
              >
                <Download size={16} className="mr-2"/>
                Download Again
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={onClose}
              >
                Close
              </Button>
            </>
          )}
          
          {state === 'error' && (
            <>
              <Button 
                variant="default" 
                size="sm"
                onClick={onRetry}
              >
                <RotateCcw size={16} className="mr-2"/>
                Try Again
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={onClose}
              >
                Cancel
              </Button>
            </>
          )}
          
          {state === 'exporting' && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onClose}
            >
              Cancel Export
            </Button>
          )}
        </div>

        {/* File Info */}
        {state === 'complete' && fileName && (
          <div className="pt-4 border-t border-border mt-4">
            <p className="text-xs text-secondary">
              File: <span className="text-white font-mono">{fileName}</span>
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ExportProgressModal;