import { FC } from 'react';
import Modal from '../../../ui/Modal';
import { BriefingCard } from '../../../../types';
import { Bot, FileText, BarChart3, AlertTriangle, TrendingUp } from 'lucide-react';

interface AIInsightModalProps {
  card: BriefingCard | null;
  isOpen: boolean;
  onClose: () => void;
}

const AIInsightModal: FC<AIInsightModalProps> = ({ card, isOpen, onClose }) => {
  if (!card) return null;

  // Enhanced AI insights based on card type
  const getDetailedInsight = () => {
    const baseInsights = {
      recommendation: {
        title: "Strategic Investment Recommendation",
        icon: <TrendingUp className="text-green-400" size={20} />,
        content: `Based on comprehensive analysis of financial data, market position, and strategic alignment, we recommend a **${card.value}** rating with **${card.subValue}**.\n\n**Key Factors Driving Recommendation:**\n• Strong market position and competitive moat\n• Consistent revenue growth above industry average\n• Proven management team with track record\n• Favorable industry tailwinds and growth prospects\n• Reasonable valuation multiples compared to peers`,
        sources: [
          "Financial Statements Analysis (2021-2024)",
          "Market Position Assessment Report",
          "Management Due Diligence Notes",
          "Industry Growth Projections"
        ]
      },
      valuation: {
        title: "Valuation Analysis & Methodology",
        icon: <BarChart3 className="text-blue-400" size={20} />,
        content: `The estimated valuation range of **${card.value}** is derived from multiple valuation approaches:\n\n**Discounted Cash Flow (DCF) Analysis:**\n• Base case: ₹1.3B using 10.5% WACC\n• Bull case: ₹1.5B with accelerated growth scenario\n• Bear case: ₹1.1B accounting for market risks\n\n**Comparable Company Analysis:**\n• Trading at 12-15x EBITDA vs peers at 14-18x\n• Revenue multiples suggest 20-30% upside potential\n• Free cash flow yield of 6.2% attractive vs sector\n\n**Precedent Transactions:**\n• Recent deals in sector at 1.8-2.2x revenue\n• Strategic premium of 15-25% for synergistic buyers`,
        sources: [
          "DCF Model - Financial Projections",
          "Comparable Company Analysis Spreadsheet",
          "Precedent Transactions Database",
          "Industry Multiples Report Q4 2024"
        ]
      },
      synergy: {
        title: "Synergy Potential & Value Creation",
        icon: <TrendingUp className="text-purple-400" size={20} />,
        content: `Synergy score of **${card.value}${card.subValue}** indicates **strong value creation potential** through this acquisition.\n\n**Cost Synergies (₹45-55M annually):**\n• IT infrastructure consolidation: ₹25M\n• Supply chain optimization: ₹15M\n• Administrative overhead reduction: ₹10M\n• Real estate rationalization: ₹5M\n\n**Revenue Synergies (₹60-75M annually):**\n• Cross-selling to existing customer base: ₹35M\n• New market entry acceleration: ₹25M\n• Enhanced product offerings: ₹15M\n\n**Implementation Timeline:**\n• Phase 1 (0-6 months): Quick wins and integration planning\n• Phase 2 (6-18 months): Major system integrations\n• Phase 3 (18-36 months): Full synergy realization`,
        sources: [
          "Synergy Identification Workshop Notes",
          "Cost Structure Analysis",
          "Customer Overlap Analysis",
          "Integration Planning Documents"
        ]
      },
      risk: {
        title: "Risk Assessment & Mitigation Strategies",
        icon: <AlertTriangle className="text-amber-400" size={20} />,
        content: `Overall risk profile of **${card.value}${card.subValue}** indicates **moderate risk** with clear mitigation pathways.\n\n**High Priority Risks:**\n• **Market Competition (Score: 75/100)** - Intense competition from global players\n  - Mitigation: Focus on niche differentiation and customer retention programs\n\n• **Integration Challenges (Score: 70/100)** - Cultural and system integration risks\n  - Mitigation: Phased integration approach with dedicated change management team\n\n• **Regulatory Compliance (Score: 65/100)** - Evolving regulatory landscape\n  - Mitigation: Enhanced compliance framework and regular audits\n\n**Medium Priority Risks:**\n• Talent retention during transition\n• Technology platform compatibility\n• Customer concentration in key accounts`,
        sources: [
          "Risk Assessment Matrix v2.3",
          "Due Diligence Findings Report",
          "Legal & Compliance Review",
          "Integration Risk Workshop Output"
        ]
      }
    };

    return baseInsights[card.id as keyof typeof baseInsights] || {
      title: card.title,
      icon: <FileText className="text-gray-400" size={20} />,
      content: card.aiInsight,
      sources: ["General Analysis Documents"]
    };
  };

  const insight = getDetailedInsight();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`AI Analysis: ${card.title}`}>
      <div className="space-y-6 max-h-[70vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <div className="flex-shrink-0">
            {insight.icon}
          </div>
          <div>
            <h3 className="font-semibold text-white text-lg">{insight.title}</h3>
            <p className="text-blue-200 text-sm">AI-powered analysis based on project documents and market data</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-surface/50 rounded-lg p-4 border border-border">
          <div className="prose prose-invert max-w-none">
            {insight.content.split('\n\n').map((paragraph, index) => (
              <p key={index} className="text-secondary mb-4 leading-relaxed">
                {paragraph.split('**').map((text, i) => 
                  i % 2 === 1 ? (
                    <strong key={i} className="text-white font-semibold">{text}</strong>
                  ) : (
                    text
                  )
                )}
              </p>
            ))}
          </div>
        </div>

        {/* Sources */}
        <div className="bg-surface/30 rounded-lg p-4 border border-border">
          <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
            <FileText size={16} />
            Supporting Documents & Sources
          </h4>
          <div className="space-y-2">
            {insight.sources.map((source, index) => (
              <div key={index} className="flex items-center gap-3 text-sm text-secondary hover:text-white transition-colors cursor-pointer group">
                <div className="w-2 h-2 bg-primary rounded-full group-hover:bg-accent transition-colors"></div>
                <span>{source}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Confidence & Timestamp */}
        <div className="flex justify-between items-center text-xs text-slate-500 border-t border-border pt-4">
          <div className="flex items-center gap-2">
            <Bot size={14} />
            <span>AI Analysis Confidence: 92%</span>
          </div>
          <span>Generated: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </Modal>
  );
};

export default AIInsightModal;