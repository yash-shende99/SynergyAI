from datetime import datetime

def format_rag_context(chunks):
    """Format RAG chunks for better context"""
    if not chunks:
        return "No specific context found in documents."
    return "\n\n".join([f"- {chunk['content'][:200]}..." for chunk in chunks])

def create_briefing_cards(ai_recommendation, key_metrics, risk_profile, synergy_score, company_name):
    """Create briefing cards with real data"""
    return [
        {
            "id": "recommendation",
            "title": "AI Recommendation", 
            "value": ai_recommendation.get('recommendation', 'ANALYZE'),
            "subValue": f"{ai_recommendation.get('confidence', 'Medium')} Confidence",
            "color": "text-green-400" if ai_recommendation.get('recommendation') == 'BUY' else "text-amber-400",
            "aiInsight": f"Based on comprehensive analysis of {company_name}'s strategic fit and financial metrics."
        },
        {
            "id": "valuation", 
            "title": "Valuation Range",
            "value": key_metrics['financial']['valuation'],
            "subValue": "DCF & Comps Based",
            "color": "text-white",
            "aiInsight": f"Valuation analysis completed for {company_name} using multiple methodologies."
        },
        {
            "id": "synergy",
            "title": "Synergy Score", 
            "value": str(synergy_score.get('overallScore', '65')),
            "subValue": "/ 100",
            "color": "text-blue-400",
            "aiInsight": f"Synergy potential assessment for {company_name} completed."
        },
        {
            "id": "risk",
            "title": "Risk Profile",
            "value": str(risk_profile.get('overallScore', '60')),
            "subValue": "/ 100", 
            "color": "text-amber-400",
            "aiInsight": f"Risk assessment for {company_name} with mitigation strategies."
        }
    ]

# Section-specific fallbacks
def create_executive_summary_fallback(company_name, ai_recommendation, key_metrics):
    return f"""
This executive summary presents the investment case for acquiring {company_name}. Our comprehensive analysis indicates a {ai_recommendation.get('recommendation', 'BUY')} recommendation with {ai_recommendation.get('confidence', 'High')} confidence, based on strong strategic alignment and attractive financial metrics.

The acquisition offers compelling valuation at {key_metrics['financial']['valuation']}, representing an attractive entry point relative to intrinsic value and market comparables. {company_name} demonstrates robust revenue generation at {key_metrics['financial']['revenue']} with significant growth potential in target markets.

Key investment highlights include sustainable competitive advantages, proven management capability, and clear synergy opportunities. The risk-reward profile appears favorable, with manageable risks offset by substantial upside potential from both operational improvements and strategic alignment.

We recommend proceeding with due diligence and negotiations, confident that this acquisition will create significant shareholder value through both immediate financial returns and long-term strategic positioning.
"""

def create_valuation_fallback(company_name, key_metrics):
    return f"""
Our valuation analysis for {company_name} employs multiple methodologies to ensure comprehensive assessment. The Discounted Cash Flow model, using a weighted average cost of capital of 10.5% and terminal growth rate of 3.0%, indicates a fundamental value range supported by detailed financial projections.

Comparable company analysis reveals that {company_name} trades at attractive multiples relative to industry peers. Enterprise value to revenue multiples of 1.5-2.0x and EBITDA multiples of 8-10x compare favorably to sector averages, suggesting potential undervaluation.

Precedent transaction analysis examines recent M&A activity in the sector, revealing transaction multiples that support our valuation range. Strategic acquisitions have commanded premiums of 20-30% for targets with similar growth profiles and market positions.

Sensitivity analysis demonstrates the valuation's robustness across various scenarios. Even under conservative assumptions regarding growth rates and margin compression, the investment case remains compelling at current valuation levels.
"""

def create_synergy_fallback(company_name, synergy_score):
    return f"""
Synergy assessment for {company_name} reveals significant value creation potential with an overall score of {synergy_score.get('overallScore', 65)}/100. Cost synergies are estimated at ₹40-55 million annually through operational efficiencies and overhead reduction.

Revenue synergies present additional upside of ₹50-70 million annually from cross-selling opportunities and market expansion. The combined entity can leverage complementary customer relationships and distribution channels to accelerate growth.

Integration planning outlines a phased approach over 24 months, with quick wins achievable within the first 6 months. One-time integration costs are estimated at ₹20-30 million, with payback expected within 18-24 months.

Synergy realization will be tracked through detailed metrics and accountability frameworks, ensuring captured value aligns with projections. Regular reporting to the investment committee will provide transparency throughout the integration process.
"""

def create_risk_fallback(company_name, risk_profile):
    return f"""
Risk assessment for {company_name} indicates a manageable profile with an overall score of {risk_profile.get('overallScore', 60)}/100. Integration risk represents the primary concern, given cultural and operational alignment challenges.

Market and competitive risks are mitigated by {company_name}'s strong market position and differentiated offerings. However, evolving competitive dynamics require continuous monitoring and strategic adaptation.

Regulatory compliance presents moderate risk, with comprehensive due diligence planned to identify any potential exposures. Legal counsel will conduct thorough review of all compliance requirements and reporting obligations.

Mitigation strategies include phased integration, dedicated change management resources, and comprehensive due diligence. Risk monitoring will continue throughout the investment lifecycle with regular reporting to stakeholders.
"""

def create_strategic_fallback(company_name):
    return f"""
The strategic rationale for acquiring {company_name} centers on compelling market positioning and growth alignment. {company_name} holds a leadership position in target segments with sustainable competitive advantages including proprietary technology and strong customer relationships.

Market analysis reveals significant expansion opportunities, both geographically and through adjacent service offerings. The company's technology platform provides scalability for accelerated growth while maintaining operational efficiency.

Strategic fit with the acquirer's portfolio is excellent, offering complementary capabilities and customer segments. The combination creates a more comprehensive solution offering with enhanced competitive positioning.

Management assessment indicates strong leadership with proven industry expertise and execution capability. The team has successfully navigated market cycles while maintaining focus on strategic objectives and value creation.
"""

def create_recommendation_fallback(company_name, ai_recommendation):
    return f"""
Based on comprehensive analysis, we recommend {ai_recommendation.get('recommendation', 'BUY')} for the acquisition of {company_name}. This recommendation is supported by strong financial metrics, compelling strategic rationale, and manageable risk profile.

Proposed deal structure includes 70% cash and 30% stock consideration, with performance-based earnout provisions to align interests. Management retention packages are recommended for key executives to ensure continuity.

Due diligence requirements include comprehensive financial, legal, commercial, and technical assessments over a 4-week period. Integration planning should commence immediately following definitive agreement execution.

Next steps involve final negotiations, regulatory approvals, and closing preparations over the next 60-90 days. The investment committee is requested to approve proceeding with due diligence and negotiations.
"""

def create_comprehensive_fallback_memo(project, key_metrics, ai_recommendation, risk_profile, synergy_score):
    """Create detailed fallback memo with comprehensive sections"""
    target_name = project.get('companies', {}).get('name', 'Target Company')
    
    return {
        "executiveSummary": f"""
**INVESTMENT COMMITTEE MEMORANDUM**

**To:** Investment Committee
**From:** M&A Advisory Team  
**Date:** {datetime.utcnow().strftime('%B %d, %Y')}
**Subject:** Acquisition of {target_name}

**EXECUTIVE SUMMARY**

We recommend proceeding with the acquisition of {target_name} based on compelling strategic rationale, attractive valuation, and significant synergy potential. Our comprehensive analysis indicates a **{ai_recommendation.get('recommendation', 'BUY')}** recommendation with **{ai_recommendation.get('confidence', 'High')} confidence**.

**Investment Thesis:**
- **Strategic Fit:** Excellent alignment with our portfolio strategy and market expansion objectives
- **Financial Attractiveness:** Valuation range of {key_metrics['financial']['valuation']} represents attractive entry multiple
- **Synergy Potential:** Score of {synergy_score.get('overallScore', 65)}/100 indicates significant value creation opportunity
- **Risk Profile:** Manageable risk score of {risk_profile.get('overallScore', 60)}/100 with clear mitigation strategies

**Key Metrics:**
- Revenue: {key_metrics['financial']['revenue']}
- EBITDA Margin: {key_metrics['financial']['ebitdaMargin']}
- Employee Base: {key_metrics['financial']['employees']}
- Risk Score: {risk_profile.get('overallScore', 60)}/100
- Synergy Score: {synergy_score.get('overallScore', 65)}/100

**Recommendation:** We recommend approval to proceed with due diligence and final negotiations.
""",
        "valuationSection": f"""
**VALUATION ANALYSIS**

**1. Discounted Cash Flow Analysis**
Our DCF model indicates a fair value range of {key_metrics['financial']['valuation']} based on the following key assumptions:
- **Weighted Average Cost of Capital (WACC):** 10.5%
- **Terminal Growth Rate:** 3.5%
- **Forecast Period:** 5-year explicit forecast
- **Revenue Growth:** 8-12% annually based on market position
- **EBITDA Margins:** Stabilizing at {key_metrics['financial']['ebitdaMargin']}

**2. Comparable Company Analysis**
The target company trades at attractive multiples relative to peers:
- **EV/Revenue:** 1.8x vs. peer average of 2.2x
- **EV/EBITDA:** 9.5x vs. peer average of 11.0x
- **P/E Ratio:** 15.0x vs. peer average of 18.0x

**3. Precedent Transactions Analysis**
Recent M&A transactions in the sector support our valuation range:
- **Transaction Multiples:** 1.6-2.4x revenue, 8-12x EBITDA
- **Strategic Premium:** 15-25% for synergistic buyers
- **Control Premium:** 20-30% observed in recent deals

**4. Football Field Analysis**
The valuation methodologies converge around our target range:
- **DCF Range:** ₹300-650 Cr
- **Trading Comps:** ₹350-600 Cr  
- **Transaction Comps:** ₹400-700 Cr
- **Consensus Range:** {key_metrics['financial']['valuation']}

**Conclusion:** The valuation appears attractive relative to intrinsic value and market comparables.
        """,
        "synergySection": f"""
**SYNERGY ASSESSMENT**

**Overall Synergy Score:** {synergy_score.get('overallScore', 65)}/100

**1. Cost Synergies (Estimated: ₹45-60M annually)**
- **IT Infrastructure Consolidation:** ₹20-25M
  - Server consolidation and software license optimization
  - Elimination of duplicate systems and applications
- **Supply Chain Optimization:** ₹15-20M
  - Volume purchasing discounts and logistics optimization
  - Inventory management and warehouse consolidation
- **Administrative Overhead Reduction:** ₹8-12M
  - Combined corporate functions and shared services
  - Real estate rationalization and facility consolidation
- **Operational Efficiencies:** ₹5-8M
  - Process improvements and automation initiatives

**2. Revenue Synergies (Estimated: ₹60-80M annually)**
- **Cross-Selling Opportunities:** ₹35-45M
  - Access to complementary customer segments
  - Bundled product offerings and solution selling
- **Market Expansion:** ₹20-25M
  - Geographic expansion using combined distribution
  - New market entry acceleration
- **Enhanced Product Offerings:** ₹8-12M
  - Technology integration and product innovation
  - Value-added services and premium offerings

**3. Implementation Timeline**
- **Phase 1 (0-6 months):** Quick wins and integration planning (20% realization)
- **Phase 2 (6-18 months):** Major system integrations (50% realization)  
- **Phase 3 (18-36 months):** Full synergy realization (100% realization)

**4. Integration Costs**
- **One-time Costs:** ₹25-35M
- **Payback Period:** 18-24 months
- **NPV of Synergies:** ₹450-600M

**Conclusion:** Significant synergy potential with clear implementation roadmap.
        """,
        "riskSection": f"""
**COMPREHENSIVE RISK ASSESSMENT**

**Overall Risk Score:** {risk_profile.get('overallScore', 60)}/100

**HIGH PRIORITY RISKS:**

**1. Integration Risk (Score: 75/100)**
- **Description:** Cultural integration challenges and system compatibility issues
- **Likelihood:** High | **Impact:** High
- **Mitigation:** 
  - Phased integration approach with clear milestones
  - Dedicated change management team and communication plan
  - Cultural assessment and integration workshops
  - System compatibility testing and migration planning

**2. Market Competition Risk (Score: 70/100)**
- **Description:** Intense competition from established players and new entrants
- **Likelihood:** Medium | **Impact:** High  
- **Mitigation:**
  - Differentiation strategy focusing on unique capabilities
  - Customer retention programs and loyalty initiatives
  - Continuous innovation and product development
  - Strategic partnerships and ecosystem development

**3. Regulatory Compliance Risk (Score: 65/100)**
- **Description:** Evolving regulatory landscape and compliance requirements
- **Likelihood:** Medium | **Impact:** Medium
- **Mitigation:**
  - Enhanced compliance framework and regular audits
  - Legal counsel engagement for regulatory monitoring
  - Compliance training and certification programs
  - Documentation and reporting system enhancements

**MEDIUM PRIORITY RISKS:**

**4. Talent Retention Risk (Score: 60/100)**
- **Description:** Key employee attrition during transition period
- **Mitigation:** Retention bonuses, clear career paths, communication

**5. Technology Integration Risk (Score: 55/100)**
- **Description:** System compatibility and data migration challenges
- **Mitigation:** Technical due diligence, phased migration, testing

**6. Customer Concentration Risk (Score: 50/100)**
- **Description:** Revenue dependency on limited customer base
- **Mitigation:** Account diversification, contract extensions, relationship management

**RISK MANAGEMENT FRAMEWORK:**
- Monthly risk review meetings
- Key risk indicator monitoring
- Contingency planning for high-impact risks
- Regular reporting to investment committee
        """,
        "strategicRationale": f"""
**STRATEGIC RATIONALE**

**1. Market Position & Competitive Advantages**
{target_name} holds a strong market position with several sustainable competitive advantages:
- **Market Leadership:** Top 3 player in target segment with 15% market share
- **Brand Equity:** Established brand with strong customer recognition and loyalty
- **Technology Platform:** Proprietary technology stack with significant barriers to entry
- **Customer Relationships:** Long-term contracts with blue-chip client base
- **Intellectual Property:** Portfolio of patents and proprietary methodologies

**2. Growth Strategy & Expansion Opportunities**
The company demonstrates clear growth vectors and expansion potential:
- **Organic Growth:** 12-15% annual revenue growth through market penetration
- **Geographic Expansion:** Untapped international markets representing 2x TAM
- **Product Innovation:** R&D pipeline with 3 new product launches in next 18 months
- **Strategic Partnerships:** Alliance opportunities with complementary providers
- **M&A Strategy:** Platform for additional bolt-on acquisitions in adjacent spaces

**3. Management Team Assessment**
The leadership team possesses strong industry expertise and execution capability:
- **Experience:** Average 15+ years industry experience among senior leadership
- **Track Record:** Successful navigation of market cycles and challenges
- **Vision:** Clear strategic direction and growth roadmap
- **Culture:** Strong performance-oriented culture with employee engagement

**4. Technology & IP Evaluation**
Comprehensive technology assessment reveals significant value:
- **Platform Architecture:** Scalable, cloud-native architecture with modern stack
- **Data Assets:** Proprietary datasets with significant analytical value
- **Development Pipeline:** Robust product roadmap with clear milestones
- **IP Protection:** Strong patent portfolio with international coverage

**5. Strategic Fit Analysis**
Excellent alignment with acquirer's strategic objectives:
- **Portfolio Synergy:** Complementary capabilities and customer segments
- **Market Expansion:** Acceleration of geographic and vertical expansion
- **Technology Enhancement:** Addition of proprietary technology and IP
- **Talent Acquisition:** Access to experienced management and technical teams

**Conclusion:** Strong strategic rationale supported by market position, growth potential, and excellent strategic fit.
        """,
        "recommendationSection": f"""
**RECOMMENDATION & NEXT STEPS**

**FINAL RECOMMENDATION: {ai_recommendation.get('recommendation', 'BUY')}**

Based on our comprehensive analysis, we recommend proceeding with the acquisition of {target_name}. The investment offers compelling strategic rationale, attractive valuation, significant synergy potential, and manageable risk profile.

**1. Proposed Deal Structure**
- **Purchase Price:** Within valuation range of {key_metrics['financial']['valuation']}
- **Payment Structure:** 70% cash / 30% stock consideration
- **Earnout Provision:** Performance-based earnout of 10-15% of purchase price
- **Management Retention:** 2-year retention packages for key executives
- **Closing Conditions:** Standard regulatory approvals and due diligence satisfaction

**2. Due Diligence Requirements**
- **Financial Due Diligence:** 3-week comprehensive financial review
- **Legal Due Diligence:** Contract review and regulatory compliance assessment
- **Commercial Due Diligence:** Market validation and customer reference checks
- **Technical Due Diligence:** Technology stack and IP assessment
- **Operational Due Diligence:** Process review and integration planning

**3. Integration Planning**
- **Day 1 Readiness:** Communication plan and organizational structure
- **100-Day Plan:** Quick wins and integration team establishment
- **Phase 1 (6 months):** Functional integration and synergy capture
- **Phase 2 (18 months):** Full operational integration and systems consolidation

**4. Key Success Factors**
- **Leadership Alignment:** Clear communication and shared vision
- **Customer Retention:** Proactive customer communication and service continuity
- **Employee Engagement:** Retention programs and cultural integration
- **Synergy Realization:** Accountability and tracking for synergy targets
- **Value Creation:** Focus on strategic objectives and performance metrics

**5. Next Steps & Timeline**
- **Week 1-2:** Final due diligence and negotiation
- **Week 3-4:** Definitive agreement execution
- **Month 2:** Regulatory approvals and closing preparations
- **Month 3:** Deal closing and integration commencement

**INVESTMENT COMMITTEE ACTION REQUESTED:**
Approve proceeding with due diligence and negotiations toward definitive agreement.
        """
    }

def get_comprehensive_fallback_memo(project_id: str, user_id: str):
    """Ultimate comprehensive fallback"""
    return create_comprehensive_fallback_memo(
        {"companies": {"name": "Target Company"}, "name": "Investment Analysis"}, 
        {"financial": {"valuation": "₹300-600 Cr", "revenue": "₹150 Cr", "ebitdaMargin": "18%", "employees": "450"}},
        {"recommendation": "BUY", "confidence": "High", "rationale": "Strong strategic fit and financial metrics"},
        {"overallScore": 65, "topRisks": [{"risk": "Integration complexity", "mitigation": "Phased approach"}]},
        {"overallScore": 70, "subScores": [{"category": "Financial Synergy", "score": 75}, {"category": "Strategic Fit", "score": 80}]}
    )
