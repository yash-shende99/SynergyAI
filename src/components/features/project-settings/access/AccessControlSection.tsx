import { FC } from 'react';
import { ProjectAccessSummary } from '../../../../types';
import Link from 'next/link';
import {Button} from '../../../ui/button';
import { Users, Shield, ArrowRight } from 'lucide-react';

interface AccessControlSectionProps {
  summary: ProjectAccessSummary;
  projectId: string;
}

const AccessControlSection: FC<AccessControlSectionProps> = ({ summary, projectId }) => (
  <div className="max-w-2xl mx-auto space-y-6">
    <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-primary"/>
        <div>
            <h2 className="text-2xl font-bold text-white">Project Access</h2>
            <p className="text-secondary">View and manage who has access to this project.</p>
        </div>
    </div>
    <div className="p-6 rounded-xl border border-border bg-surface/50">
        <h3 className="font-semibold text-white">Access Summary</h3>
        <p className="text-sm text-secondary mt-2">This project currently has a team of <strong className="text-white">{summary.totalMembers}</strong> members, including <strong className="text-white">{summary.adminCount}</strong> project admins with full control.</p>
        <div className="mt-4 pt-4 border-t border-border/50">
            <Link href={`/dashboard/project/${projectId}/team`}>
                <Button variant="default">
                    Manage Team & Permissions
                    <ArrowRight size={16} className="ml-2"/>
                </Button>
            </Link>
        </div>
    </div>
  </div>
);

export default AccessControlSection;
