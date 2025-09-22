import { FC, useState } from 'react';
import { Bot, Zap } from 'lucide-react';
import {Button} from '../../../ui/button';

interface ProjectSelectionViewProps {
  state: 'selection' | 'generating';
  onGenerate: (projectName: string) => void;
}

const ProjectSelectionView: FC<ProjectSelectionViewProps> = ({ state, onGenerate }) => {
    const [selectedProject, setSelectedProject] = useState('');
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8 rounded-xl border border-border bg-surface/50">
            <Bot size={48} className="text-primary mb-4"/>
            <h2 className="text-2xl font-bold text-white">Generate Your AI-Powered Investment Memo</h2>
            <p className="text-secondary mt-2 max-w-xl">First, select the project you want to analyze to generate a comprehensive, editable first draft.</p>
            
            <div className="mt-8 w-full max-w-sm">
                {state === 'selection' && (
                    <>
                        <select 
                            value={selectedProject}
                            onChange={(e) => setSelectedProject(e.target.value)}
                            className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-center"
                        >
                            <option value="" disabled>-- Select a Project --</option>
                            <option value="Project Helios">Project Helios - SolarTech Acquisition</option>
                            <option value="Project Neptune">Project Neptune - AquaLogistics</option>
                        </select>
                        <Button onClick={() => onGenerate(selectedProject)} disabled={!selectedProject} size="default" className="w-full text-md px-8 py-3 mt-4">
                            <Zap size={20} className="mr-2"/> Generate Memo
                        </Button>
                    </>
                )}
                 {state === 'generating' && (
                    <div className="flex flex-col items-center">
                        <p className="text-primary animate-pulse">Analyzing Synergy Score... Building Risk Profile...</p>
                    </div>
                )}
            </div>
        </div>
    );
};
export default ProjectSelectionView;