'use client';

import { FC, useState, useEffect } from 'react';
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

  // Debug: Log the memo data to see what we're receiving
  useEffect(() => {
    console.log('📊 Memo Data in Workspace:', memo);
    console.log('📝 Executive Summary length:', memo.executiveSummary?.length);
    console.log('💰 Valuation Section length:', memo.valuationSection?.length);
    console.log('🔄 Synergy Section length:', memo.synergySection?.length);
  }, [memo]);

  // Ensure all content is properly mapped with fallbacks
  const sections = [
    {
      id: 'executiveSummary',
      title: 'Executive Summary',
      content: memo.executiveSummary || 'Executive summary content not available.'
    },
    {
      id: 'valuationSection',
      title: 'Valuation Analysis',
      content: memo.valuationSection || 'Valuation analysis content not available.'
    },
    {
      id: 'synergySection',
      title: 'Synergy Assessment',
      content: memo.synergySection || 'Synergy assessment content not available.'
    },
    {
      id: 'riskSection',
      title: 'Risk Profile',
      content: memo.riskSection || 'Risk analysis content not available.'
    },
    {
      id: 'strategicRationale',
      title: 'Strategic Rationale',
      content: memo.strategicRationale || 'Strategic rationale content not available.'
    },
    {
      id: 'recommendationSection',
      title: 'Recommendations',
      content: memo.recommendationSection || 'Recommendations content not available.'
    }
  ];

  const currentSection = sections.find(s => s.id === activeSection) || sections[0];

  // Debug: Log when section changes
  useEffect(() => {
    console.log(`🔄 Section changed to: ${currentSection.title}`);
    console.log(`📄 Content preview: ${currentSection.content?.substring(0, 100)}...`);
  }, [currentSection]);

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
        <div className="flex gap-2 border-b border-border pb-2 overflow-x-auto">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => {
                console.log(`🔄 Switching to section: ${section.id}`);
                console.log(`📄 Section content length: ${section.content?.length}`);
                setActiveSection(section.id);
              }}
              className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors whitespace-nowrap ${activeSection === section.id
                ? 'bg-primary text-white'
                : 'text-secondary hover:text-white hover:bg-surface/50'
                }`}
            >
              {section.title}
            </button>
          ))}
        </div>

        {/* Debug: Show which section is active
        <div className="text-xs text-slate-500 bg-slate-800 p-2 rounded">
          Active Section: <strong>{currentSection.title}</strong> (ID: {currentSection.id}) | 
          Content Length: {currentSection.content?.length} chars
        </div> */}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            {/* KEY FIX: Use key prop to force re-render when section changes */}
            <EditableMemo
              key={currentSection.id} // This forces React to create a new instance when section changes
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
        memo={memo}  // Pass the memo data
      />
    </>
  );
};

export default MemoWorkspace;