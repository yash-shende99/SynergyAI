import { FC } from 'react';
import { SynergyAiScore } from '../../../../types';
import ScoreboardPanel from './ScoreboardPanel';
import AiRationalePanel from './AiRationalePanel';

const SynergyScoreSection: FC<{ scoreData: SynergyAiScore }> = ({ scoreData }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <ScoreboardPanel 
          overallScore={scoreData.overallScore} 
          subScores={scoreData.subScores} 
        />
      </div>
      <div className="lg:col-span-2">
        <AiRationalePanel rationale={scoreData.rationale} />
      </div>
    </div>
  );
};
export default SynergyScoreSection;