'use client';

import { FC, useState } from 'react';
import { InvestmentMemo, BriefingCardData } from '../../../../types';
import MemoHeader from './MemoHeader';
import BriefingDashboard from './BriefingDashboard';
import EditableMemo from './EditableMemo';
import ContextSidebar from './ContextSidebar';
import AIInsightModal from './AIInsightModal';
import ExportModal from './ExportModal';

interface MemoWorkspaceProps {
  memo: InvestmentMemo;
  onGoBack: () => void;
}

const MemoWorkspace: FC<MemoWorkspaceProps> = ({ memo, onGoBack }) => {
  const [activeModal, setActiveModal] = useState<BriefingCardData | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('executiveSummary');

  const sections = [
    { id: 'executiveSummary', title: 'Executive Summary', content: memo.executiveSummary },
    { id: 'valuationSection', title: 'Valuation Analysis', content: memo.valuationSection },
    { id: 'synergySection', title: 'Synergy Assessment', content: memo.synergySection },
    { id: 'riskSection', title: 'Risk Profile', content: memo.riskSection }
  ];

  const currentSection = sections.find(s => s.id === activeSection) || sections[0];

  return (
    <>
      <div className="space-y-6 p-6">
        <MemoHeader 
          projectName={memo.projectName} 
          onExport={() => setIsExportModalOpen(true)} 
          onGoBack={onGoBack} 
        />
        
        <BriefingDashboard 
          cards={memo.briefingCards} 
          onCardClick={(card) => setActiveModal(card)} 
        />

        {/* Section Navigation */}
        <div className="flex gap-2 border-b border-border pb-2">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
                activeSection === section.id
                  ? 'bg-primary text-white'
                  : 'text-secondary hover:text-white hover:bg-surface/50'
              }`}
            >
              {section.title}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <EditableMemo 
              initialContent={currentSection.content}
              sectionTitle={currentSection.title}
            />
          </div>
          <div className="lg:col-span-4">
            <ContextSidebar />
          </div>
        </div>
      </div>
      
      <AIInsightModal 
        card={activeModal} 
        isOpen={!!activeModal} 
        onClose={() => setActiveModal(null)} 
      />
      
      <ExportModal 
        isOpen={isExportModalOpen} 
        onClose={() => setIsExportModalOpen(false)} 
      />
    </>
  );
};

export default MemoWorkspace;