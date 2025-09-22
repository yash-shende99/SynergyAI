'use client';

import { useState } from 'react';
import InputTablePanel from './InputTablePanel';
import VisualizationPanel from './VisualizationPanel';
import ActionPanel from './ActionPanel';
import ChartModal from '../workspace/ChartModal';
import { ModelRow } from '../../../../types';

// Updated initial state with the EBITDA Margin row
const initialModelData: ModelRow[] = [
  { id: 'rev', label: 'Revenue', type: 'INPUT', values: [500, 550, 605, 665] },
  { id: 'cogs', label: 'COGS', type: 'INPUT', values: [200, 220, 242, 266] },
  { id: 'gp', label: 'Gross Profit', type: 'FORMULA', values: [300, 330, 363, 399] },
  { id: 'sga', label: 'SG&A', type: 'INPUT', values: [100, 110, 121, 133] },
  { id: 'ebitda', label: 'EBITDA', type: 'FORMULA', values: [200, 240, -50, 266] }, // Added a negative value for testing
  { id: 'ebitdaMargin', label: 'EBITDA Margin', type: 'PERCENTAGE', values: [40, 43.6, -8.3, 40] },
];

export default function LiveModelsSection() {
  const [modelData, setModelData] = useState<ModelRow[]>(initialModelData);
  const [isChartModalOpen, setIsChartModalOpen] = useState(false);

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        <div className="lg:col-span-2">
          <InputTablePanel modelData={modelData} setModelData={setModelData} />
        </div>
        <div className="space-y-6">
          <VisualizationPanel modelData={modelData} onChartExpand={() => setIsChartModalOpen(true)} />
          <ActionPanel />
        </div>
      </div>
      <ChartModal isOpen={isChartModalOpen} onClose={() => setIsChartModalOpen(false)} />
    </>
  );
}