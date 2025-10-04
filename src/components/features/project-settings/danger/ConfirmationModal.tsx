'use client';

import { FC, useState, useEffect } from 'react';
import Modal from '../../../ui/Modal';
import {Button} from '../../../ui/button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  description: string;
  confirmText: string;
  confirmVariant: 'default' | 'destructive';
  requiresConfirmationText?: string;
}

const ConfirmationModal: FC<ConfirmationModalProps> = ({
  isOpen, onClose, onConfirm, title, description, confirmText, confirmVariant, requiresConfirmationText
}) => {
  const [confirmationInput, setConfirmationInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const isConfirmDisabled = requiresConfirmationText ? confirmationInput !== requiresConfirmationText : false;

  const handleConfirm = async () => {
    setIsLoading(true);
    await onConfirm();
    setIsLoading(false);
    onClose();
  };

  useEffect(() => {
    if (!isOpen) setConfirmationInput(''); // Reset input on close
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
        <div className="space-y-4">
            <div className="flex items-start gap-3">
                <AlertTriangle className="h-10 w-10 text-amber-400 flex-shrink-0"/>
                <p className="text-sm text-secondary">{description}</p>
            </div>
            {requiresConfirmationText && (
                <input 
                    type="text"
                    value={confirmationInput}
                    onChange={e => setConfirmationInput(e.target.value)}
                    placeholder="Type to confirm..."
                    className="w-full bg-background border border-border rounded-md p-2"
                />
            )}
            <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <Button variant="secondary" onClick={onClose}>Cancel</Button>
                <Button variant={confirmVariant} onClick={handleConfirm} disabled={isConfirmDisabled || isLoading}>
                    {isLoading ? 'Processing...' : confirmText}
                </Button>
            </div>
        </div>
    </Modal>
  );
};
export default ConfirmationModal;
