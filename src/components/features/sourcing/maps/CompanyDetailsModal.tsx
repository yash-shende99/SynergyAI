import { FC } from 'react';
import { CompanyMapProfile } from '../../../../types';
import Modal from '../../../ui/Modal'; // Our reusable modal

const CompanyDetailsModal: FC<{ company: CompanyMapProfile | null, onClose: () => void }> = ({ company, onClose }) => {
  if (!company) return null;
  return (
    <Modal isOpen={!!company} onClose={onClose} title={company.name}>
        <p className="text-secondary">A full, detailed company profile with financials, executives, and news would be displayed here.</p>
    </Modal>
  );
};
export default CompanyDetailsModal;