import { FC } from 'react';
import Modal from '../../../ui/Modal';
import { BriefingCard } from '../../../../types';
import { Bot } from 'lucide-react';

interface AIInsightModalProps {
  card: BriefingCard | null;
  isOpen: boolean;
  onClose: () => void;
}

const AIInsightModal: FC<AIInsightModalProps> = ({ card, isOpen, onClose }) => {
  if (!card) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`AI Insight: ${card.title}`}>
      <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
        <div className="flex items-center gap-2 mb-2">
          <Bot size={16} className="text-primary"/>
          <h4 className="text-sm font-bold text-white">AI-Generated Analysis</h4>
        </div>
        <p className="text-sm text-blue-200">{card.aiInsight}</p>
      </div>
    </Modal>
  );
};
export default AIInsightModal;