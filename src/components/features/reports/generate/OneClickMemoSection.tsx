'use client';

import { useState } from 'react';
import { BriefingCard, Draft } from '../../../../types';
import { useReportStore } from '../../../../store/reportStore';
import { useRouter } from 'next/navigation';
import ProjectSelectionView from './ProjectSelectionView';
import MemoWorkspace from './MemoWorkspace';
import Modal from '../../../ui/Modal';
import RiskScoreExpandedView from '../../analytics/risk/RiskScoreExpandedView';
import AIInsightModal from './AIInsightModal';
import ExportModal from './ExportModal';

// Mock Data
const briefingData: BriefingCard[] = [
    { id: 'recommendation', title: 'AI Recommendation', value: 'BUY', subValue: '85% Confidence', color: 'text-green-400', aiInsight: 'The acquisition is recommended due to strong synergy potential and a fair valuation, though operational risks must be mitigated.' },
    { id: 'valuation', title: 'Est. Valuation', value: '$1.2B-$1.5B', subValue: 'Based on DCF', color: 'text-white', aiInsight: 'Our DCF model, using a 10.5% WACC and 3.5% terminal growth rate, suggests a fair value range of $1.2B to $1.5B. This is in line with recent precedent transactions in the sector.' },
    { id: 'synergy', title: 'Synergy Score', value: '72', subValue: '/ 100', color: 'text-blue-400', aiInsight: 'The model projects significant cost synergies (~$50M) from supply chain consolidation and revenue synergies (~$70M) from cross-selling opportunities into new markets.' },
    { id: 'risk', title: 'Risk Profile', value: '68', subValue: '/ 100', color: 'text-amber-400', aiInsight: 'The overall risk score is moderate-high, primarily driven by legal risks associated with pending litigation and reputational risks from recent negative press.' },
];

export default function OneClickMemoSection() {
  const [step, setStep] = useState<'selection' | 'generating' | 'workspace'>('selection');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<BriefingCard | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const addDraft = useReportStore((state) => state.addDraft);
  const router = useRouter();

  const handleGenerate = (projectName: string) => {
    setSelectedProject(projectName);
    setStep('generating');
    setTimeout(() => setStep('workspace'), 2000);
  };

  const handleSaveToDrafts = () => {
    const newDraft: Draft = {
      id: `draft-${Date.now()}`,
      title: `Investment Memo: ${selectedProject}`,
      createdBy: { name: 'Yash Shende', avatarUrl: 'https://placehold.co/24x24/E2E8F0/111827?text=YS' },
      lastModified: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric'}),
      status: 'Draft',
    };
    addDraft(newDraft);
    alert(`"${newDraft.title}" has been saved to Drafts.`);
    router.push('/dashboard/reports');
  };

  if (step !== 'workspace') {
    return <ProjectSelectionView state={step} onGenerate={handleGenerate} />;
  }

  const handleGoBackToSelection = () => {
    setSelectedProject(null);
    setStep('selection');
  };

  return (
    <>
      <MemoWorkspace
        projectName={selectedProject!}
        briefingData={briefingData}
        onCardClick={(card) => setActiveModal(card)}
        onSave={handleSaveToDrafts}
        onExport={() => setIsExportModalOpen(true)}
        onGoBack={handleGoBackToSelection}
      />
      
      {/* Risk Profile Modal */}
      <Modal isOpen={activeModal?.id === 'risk'} onClose={() => setActiveModal(null)} title="Detailed Risk Breakdown">
          <RiskScoreExpandedView />
      </Modal>

      {/* Other AI Insight Modals */}
      <AIInsightModal 
        card={activeModal}
        isOpen={activeModal?.id === 'recommendation' || activeModal?.id === 'valuation' || activeModal?.id === 'synergy'}
        onClose={() => setActiveModal(null)}
      />
      
      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </>
  );
}