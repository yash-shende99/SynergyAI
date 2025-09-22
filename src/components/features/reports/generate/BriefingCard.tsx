import { FC } from 'react';
import { BriefingCard as BriefingCardType } from '../../../../types';

const BriefingCard: FC<{ card: BriefingCardType; onClick: () => void; }> = ({ card, onClick }) => (
  <button onClick={onClick} className={`p-4 rounded-xl border border-border bg-surface/50 text-left transition-all hover:border-primary/50 hover:bg-surface`}>
    <p className="text-xs font-semibold text-secondary">{card.title}</p>
    <p className={`text-3xl font-bold ${card.color}`}>{card.value}
        <span className="text-lg text-slate-400">{card.subValue}</span>
    </p>
    <p className="text-xs text-primary mt-2">Click for details →</p>
  </button>
);
export default BriefingCard;