import { FC } from 'react';
import { BriefingCard as BriefingCardType } from '../../../../types';
import BriefingCard from './BriefingCard';

interface BriefingDashboardProps {
  cards: BriefingCardType[];
  onCardClick: (card: BriefingCardType) => void;
}

const BriefingDashboard: FC<BriefingDashboardProps> = ({ cards, onCardClick }) => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map(card => (
            <BriefingCard key={card.id} card={card} onClick={() => onCardClick(card)} />
        ))}
    </div>
);
export default BriefingDashboard;