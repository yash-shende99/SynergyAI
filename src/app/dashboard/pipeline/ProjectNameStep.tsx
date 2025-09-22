// components/pipeline/ProjectNameStep.tsx
import { FC } from 'react';
import { Company } from '../../../types';
import { Button } from '../../../components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface ProjectNameStepProps {
  projectName: string;
  setProjectName: (name: string) => void;
  selectedCompany: Company;
  onNext: () => void; // Add this
  onBack: () => void; // Add this
}

const ProjectNameStep: FC<ProjectNameStepProps> = ({ 
  projectName, 
  setProjectName, 
  selectedCompany,
  onNext,
  onBack 
}) => {
  const suggestions = [
    `Acquisition of ${selectedCompany.name}`,
    `Merger with ${selectedCompany.name}`,
    `${selectedCompany.name} Investment Analysis`,
    `Strategic Partnership with ${selectedCompany.name}`,
    `${selectedCompany.name} Due Diligence`
  ];

  const isNextDisabled = !projectName.trim();

  return (
    <div>
      <h4 className="font-semibold text-white mb-2">Step 2: Name Your Project</h4>
      
      <div className="mb-3">
        <label className="block text-sm text-secondary mb-1">Project Name</label>
        <input
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="Enter project name..."
          className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      <div className="mb-6">
        <p className="text-sm text-secondary mb-2">Quick suggestions:</p>
        <div className="space-y-1">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setProjectName(suggestion)}
              className="w-full text-left p-2 text-sm text-secondary hover:bg-surface/50 rounded-lg transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <Button onClick={onBack} variant="secondary" size="sm">
          <ArrowLeft size={16} className="mr-2"/>Back
        </Button>
        <Button 
          onClick={onNext} 
          variant="default"
          disabled={isNextDisabled}
        >
          Next <ArrowRight size={16} className="ml-2"/>
        </Button>
      </div>
    </div>
  );
};

export default ProjectNameStep;