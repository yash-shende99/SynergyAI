import RiskAlertsPanel from './RiskAlertsPanel';
import RiskScorecard from './RiskScorecard';
import KnowledgeGraphMiniView from './KnowledgeGraphMiniView';

const KeyRisksSection = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* The main AI-generated alerts panel takes up the left side */}
      <div className="lg:col-span-2">
        <RiskAlertsPanel />
      </div>

      {/* The scorecards and graph take up the right side */}
      <div className="space-y-6">
        <RiskScorecard dealName="Project Helios - SolarTech" financialRisk={72} legalRisk={65} operationalRisk={80} />
        <RiskScorecard dealName="Project Neptune - AquaLogistics" financialRisk={45} legalRisk={55} operationalRisk={30} />
        <KnowledgeGraphMiniView />
      </div>
    </div>
  );
};

export default KeyRisksSection;