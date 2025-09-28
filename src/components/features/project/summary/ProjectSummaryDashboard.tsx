import { FC } from 'react';
import { ProjectSummary } from '../../../../types';
import ExecutiveSummaryCard from './ExecutiveSummaryCard';
import KeyDataCard from './KeyDataCard';
import StrengthsAndRisksPanel from './StrengthsAndRisksPanel';

const ProjectSummaryDashboard: FC<{ data: ProjectSummary }> = ({ data }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <ExecutiveSummaryCard summary={data.executiveSummary} />
        </div>
        <div className="lg:col-span-1">
            <KeyDataCard data={data.keyData} />
        </div>
    </div>
    <div>
        <StrengthsAndRisksPanel strengths={data.keyStrengths} risks={data.keyRisks} />
    </div>
  </div>
);

export default ProjectSummaryDashboard;
