// components/HowItWorksSection.jsx
import React from 'react';
import { Database, Cpu, BarChart3 } from 'lucide-react';

const steps = [
  {
    icon: <Database className="h-12 w-12 text-synergy-ai-primary" />,
    title: 'Ingest & Analyze',
    description: 'Import structured and unstructured data from financials, filings, news, and market sources.',
    features: ['Financial statements', 'Market data', 'News & filings', 'Industry reports']
  },
  {
    icon: <Cpu className="h-12 w-12 text-synergy-ai-primary" />,
    title: 'AI Modeling & Insights',
    description: 'Our AI models analyze trends, performance metrics, and synergy potential using proprietary algorithms.',
    features: ['NLP analysis', 'ML forecasting', 'Pattern recognition', 'Risk scoring']
  },
  {
    icon: <BarChart3 className="h-12 w-12 text-synergy-ai-primary" />,
    title: 'Decision Intelligence',
    description: 'Get AI-generated valuations, synergy maps, and risk summaries ready for investment decisions.',
    features: ['Valuation reports', 'Synergy analysis', 'Risk alerts', 'Executive summaries']
  }
];

const HowItWorksSection = () => {
  return (
    <div className="bg-gradient-to-b from-surface to-background py-16 md:py-24" id="how-it-works">
    <div className="px-4 sm:px-6 lg:px-8">

      <div className="section-container">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How SynergyAI <span className="bg-gradient-to-r from-synergy-ai-primary to-synergy-ai-purple-light bg-clip-text text-transparent">Transforms Your Workflow</span>
          </h2>
          <p className="text-gray-400 text-lg">
            From data to decisions in three simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
          {/* Connecting line */}
          <div className="hidden lg:block absolute top-24 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-synergy-ai-primary to-synergy-ai-purple-light transform -translate-y-1/2 z-0"></div>
          
          {steps.map((step, index) => (
            <div key={index} className="relative z-10">
              <div className="bg-surface rounded-2xl p-8 border border-border hover:border-synergy-ai-primary/30 transition-all duration-300 card-shadow">
                <div className="flex items-center justify-center w-20 h-20 bg-synergy-ai-primary/10 rounded-2xl mb-6 mx-auto">
                  {step.icon}
                </div>
                
                <div className="text-center mb-4">
                  <div className="inline-block bg-synergy-ai-primary text-white text-sm font-bold px-3 py-1 rounded-full mb-2">
                    Step {index + 1}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-gray-400 mb-6">{step.description}</p>
                </div>

                <ul className="space-y-3">
                  {step.features.map((feature, i) => (
                    <li key={i} className="flex items-center text-gray-300">
                      <div className="w-2 h-2 bg-synergy-ai-primary rounded-full mr-3"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    </div>
  );
};

export default HowItWorksSection;