import { FC, useState } from 'react';
import Modal from '../../../components/ui/Modal';
import { Company } from '../../../types';
import CompanySearchStep from './CompanySearchStep';
import TeamSelectStep from './TeamSelectStep';
import ProjectNameStep from './ProjectNameStep';

interface CreateProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreateProject: (data: { name: string; companyCin: string; teamEmails: string[] }) => void;
}

const CreateProjectModal: FC<CreateProjectModalProps> = ({ isOpen, onClose, onCreateProject }) => {
    const [step, setStep] = useState(1);
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
    const [teamEmails, setTeamEmails] = useState<string[]>([]);
    const [projectName, setProjectName] = useState('');

    const handleCompanySelect = (company: Company) => {
        setSelectedCompany(company);
        setProjectName(`Acquisition of ${company.name}`);
        setStep(2);
    };

    const handleFinalCreate = () => {
        if (!selectedCompany || !projectName.trim()) return;
        onCreateProject({
            name: projectName.trim(),
            companyCin: selectedCompany.id,
            teamEmails
        });
    };

    // Reset state when modal is closed
    const handleClose = () => {
        setStep(1);
        setSelectedCompany(null);
        setTeamEmails([]);
        setProjectName(''); // Reset name too
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Create New Deal Project">
            {step === 1 && <CompanySearchStep onCompanySelect={handleCompanySelect} />}
            {step === 2 && selectedCompany && (
                <ProjectNameStep
                    projectName={projectName}
                    setProjectName={setProjectName}
                    selectedCompany={selectedCompany}
                    onNext={() => setStep(3)}
                    onBack={() => setStep(1)}
                />
            )}
            {step === 3 && selectedCompany && (
                <TeamSelectStep
                    selectedCompany={selectedCompany}
                    teamEmails={teamEmails}
                    setTeamEmails={setTeamEmails}
                    onBack={() => setStep(2)}
                    onFinalCreate={handleFinalCreate}
                    projectName={projectName}
                />
            )}
        </Modal>
    );
};
export default CreateProjectModal;
