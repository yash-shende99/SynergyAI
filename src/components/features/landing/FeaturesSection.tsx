// components/FeaturesSection.jsx
import React from 'react';
import { Search, TrendingUp, Shield, MessageSquare, Users, FileText } from 'lucide-react';

const features = [
  {
    icon: <Search className="h-8 w-8 text-synergy-ai-primary" />,
    title: 'AI Deal Sourcing',
    description: 'Identify promising acquisition targets using NLP, financial signals, and market data analysis.'
  },
  {
    icon: <TrendingUp className="h-8 w-8 text-synergy-ai-primary" />,
    title: 'Predictive Valuation',
    description: 'Leverage ensemble AI models for dynamic, data-driven company valuations and growth projections.'
  },
  {
    icon: <Shield className="h-8 w-8 text-synergy-ai-primary" />,
    title: 'Risk & Synergy Analysis',
    description: 'Detect operational, financial, and market risks while quantifying synergy potential between entities.'
  },
  {
    icon: <MessageSquare className="h-8 w-8 text-synergy-ai-primary" />,
    title: 'AI Co-Pilot',
    description: 'Chat with your data — get instant insights and explanations from your AI analyst assistant.'
  },
  {
    icon: <Users className="h-8 w-8 text-synergy-ai-primary" />,
    title: 'Collaboration Tools',
    description: 'Share insights, reports, and deal rooms securely with your team and stakeholders.'
  },
  {
    icon: <FileText className="h-8 w-8 text-synergy-ai-primary" />,
    title: 'Automated Reporting',
    description: 'Generate comprehensive due diligence reports and investment memos in minutes, not hours.'
  }
];

const FeaturesSection = () => {
  return (
    <div className="bg-background py-16 md:py-24" id="features">
    <div className="px-4 sm:px-6 lg:px-8">

      <div className="section-container">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            End-to-End Intelligence for <span className="bg-gradient-to-r from-synergy-ai-primary to-synergy-ai-purple-light bg-clip-text text-transparent">Modern Dealmakers</span>
          </h2>
          <p className="text-gray-400 text-lg">
            Our comprehensive AI-powered platform transforms how investment professionals discover, analyze, and execute deals.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-surface p-8 rounded-xl border border-border hover:border-synergy-ai-primary/50 transition-all duration-300 card-shadow group hover:transform hover:-translate-y-2"
            >
              <div className="bg-synergy-ai-primary/10 w-16 h-16 flex items-center justify-center rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
    </div>
  );
};

export default FeaturesSection;