
import { FC } from 'react';
import Link from 'next/link';
import { Project } from '../../../types';

const ProjectCard: FC<{ project: any }> = ({ project }) => ( // Using any for mock data flexibility
    <Link href={`/dashboard/project/${project.id}`}>
        <div className="p-6 rounded-xl border border-border bg-surface/50 h-full hover:border-primary transition-colors cursor-pointer">
            <p className="text-xs text-amber-400 font-semibold">{project.status}</p>
            <h3 className="font-bold text-white mt-1">{project.name}</h3>
            <div className="flex -space-x-2 pt-4 mt-4 border-t border-border/50">
                {project.team.map((member: string) => (
                    <img key={member} className="h-7 w-7 rounded-full ring-2 ring-surface" src={`https://placehold.co/28x28/E2E8F0/111827?text=${member}`} title={member}/>
                ))}
            </div>
        </div>
    </Link>
);
export default ProjectCard;

