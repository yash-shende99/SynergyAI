import { FC, useState } from 'react';
import { Company } from '../../../types';
import {Button} from '../../../components/ui/button';
import { Plus, X, ArrowLeft } from 'lucide-react';

interface TeamSelectStepProps {
  selectedCompany: Company;
  teamEmails: string[];
  setTeamEmails: (emails: string[]) => void;
  onBack: () => void;
  onFinalCreate: () => void;
  projectName: string; // Add this
}

const TeamSelectStep: FC<TeamSelectStepProps> = ({ selectedCompany, teamEmails, setTeamEmails, onBack, onFinalCreate, projectName }) => {
  const [emailInput, setEmailInput] = useState('');
  const handleAddEmail = () => {
    if (emailInput && !teamEmails.includes(emailInput)) {
      setTeamEmails([...teamEmails, emailInput]);
      setEmailInput('');
    }
  };

  const isCreateDisabled = !projectName.trim(); // Disable create if no name

  return (
    <div>
      <h4 className="font-semibold text-white mb-2">Step 3: Add Team Members for "{selectedCompany.name}"</h4>
      <div className="mb-4 p-3 bg-surface/50 rounded-lg">
        <p className="text-sm text-secondary">Project Name:</p>
        <p className="text-white font-medium">{projectName}</p>
      </div>
      <div className="flex gap-2">
        <input value={emailInput} onChange={e => setEmailInput(e.target.value)} placeholder="Enter teammate's email..." className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-lg text-white ..."/>
        <Button onClick={handleAddEmail} size="sm"><Plus size={16}/></Button>
      </div>
      <div className="mt-4 space-y-2">
        {teamEmails.map(email => (
          <div key={email} className="flex justify-between items-center p-2 bg-background/50 rounded">
            <span className="text-sm text-slate-300">{email}</span>
            <button onClick={() => setTeamEmails(teamEmails.filter(e => e !== email))} className="text-secondary hover:text-red-500"><X size={14}/></button>
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-between items-center">
        <Button onClick={onBack} variant="secondary" size="sm"><ArrowLeft size={16} className="mr-2"/>Back</Button>
        <Button onClick={onFinalCreate} variant="default">Create Project</Button>
      </div>
    </div>
  );
};
export default TeamSelectStep;