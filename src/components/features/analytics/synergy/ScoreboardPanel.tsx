import { FC } from 'react';
import { SynergySubScore } from '../../../../types';
import SynergyGauge from './SynergyGauge';
import SubScoreCard from './SubScoreCard';

interface ScoreboardPanelProps {
  overallScore: number;
  subScores: SynergySubScore[];
}

const ScoreboardPanel: FC<ScoreboardPanelProps> = ({ overallScore, subScores }) => (
  <div className="p-6 rounded-xl border border-border bg-surface/50 h-full sticky top-6">
    <h3 className="font-bold text-white text-center">Overall SynergyAI Score</h3>
    <SynergyGauge score={overallScore} />
    <div className="space-y-4 mt-6">
      {subScores.map(score => (
        <SubScoreCard key={score.category} subScore={score} />
      ))}
    </div>
  </div>
);
export default ScoreboardPanel;