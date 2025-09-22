import { useState } from 'react';

const DetailedInsightsPanel = () => {
  const [activeTab, setActiveTab] = useState('Table');
  return (
    <div className="p-4 rounded-xl border border-border bg-surface/50">
      <div className="flex border-b border-border mb-4">
        <button onClick={() => setActiveTab('Table')} className={`px-3 py-1 text-sm ${activeTab === 'Table' ? 'text-primary border-b-2 border-primary' : 'text-secondary'}`}>Table View</button>
        <button onClick={() => setActiveTab('Narrative')} className={`px-3 py-1 text-sm ${activeTab === 'Narrative' ? 'text-primary border-b-2 border-primary' : 'text-secondary'}`}>AI Narrative</button>
      </div>
      <div>
        {activeTab === 'Table' && <p className="text-secondary text-sm">[Detailed table with Category, $, Confidence would go here.]</p>}
        {activeTab === 'Narrative' && <p className="text-secondary text-sm">[AI-generated narrative text would go here.]</p>}
      </div>
    </div>
  );
};
export default DetailedInsightsPanel;