import { FC } from 'react';
import { AISummary } from '../../../types';
import NaturalLanguageSummaryPanel from './NaturalLanguageSummaryPanel';
import DealDistributionChart from './DealDistributionChart';

interface AISummarySectionProps {
  chartData: AISummary['distribution'];
  narrative: string | null;
  isNarrativeLoading: boolean;
}

const AISummarySection: FC<AISummarySectionProps> = ({ chartData, narrative, isNarrativeLoading }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <NaturalLanguageSummaryPanel 
          narrative={narrative}
          isLoading={isNarrativeLoading}
        />
      </div>
      <div className="space-y-6">
        <DealDistributionChart title="Deals by Sector" data={chartData.bySector} />
        <DealDistributionChart title="Deals by Status" data={chartData.byStatus} />
      </div>
    </div>
  );
};
export default AISummarySection;