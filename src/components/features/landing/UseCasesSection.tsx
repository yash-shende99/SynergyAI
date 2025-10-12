// components/UseCasesSection.jsx
import React from 'react';
import { Users, Building2, PieChart, Briefcase } from 'lucide-react';

const useCases = [
  {
    icon: <Users className="h-8 w-8 text-synergy-ai-primary" />,
    title: 'Investment Analysts',
    description: 'Automated company screening and valuation generation cuts research time by 60%.',
    metrics: ['60% faster analysis', 'Enhanced accuracy', 'Real-time insights']
  },
  {
    icon: <Building2 className="h-8 w-8 text-synergy-ai-primary" />,
    title: 'M&A Teams',
    description: 'Identify strategic fits and quantify synergy opportunities faster and more accurately.',
    metrics: ['Better deal sourcing', 'Quantified synergies', 'Risk mitigation']
  },
  {
    icon: <PieChart className="h-8 w-8 text-synergy-ai-primary" />,
    title: 'Private Equity',
    description: 'Assess portfolio performance and market positioning with real-time analytics.',
    metrics: ['Portfolio optimization', 'Market timing', 'Exit strategy planning']
  },
  {
    icon: <Briefcase className="h-8 w-8 text-synergy-ai-primary" />,
    title: 'Consulting Firms',
    description: 'Generate instant deal briefs and market intelligence reports for clients.',
    metrics: ['Faster deliverables', 'Data-driven insights', 'Competitive edge']
  }
];

const testimonials = [
  {
    text: "SynergyAI reduced our due diligence time from weeks to days. The AI insights uncovered risks we would have missed.",
    author: "Sarah Chen",
    position: "Partner, Vertex Capital",
    metric: "67% faster analysis"
  },
  {
    text: "The predictive valuation models are incredibly accurate. We've made better investment decisions using SynergyAI.",
    author: "Marcus Johnson",
    position: "Investment Director, TechGrowth Partners",
    metric: "23% better returns"
  }
];

const UseCasesSection = () => {
  return (
    <div className="bg-background py-16 md:py-24" id="use-cases">
    <div className="px-4 sm:px-6 lg:px-8">

      <div className="section-container">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Trusted by <span className="bg-gradient-to-r from-synergy-ai-primary to-synergy-ai-purple-light bg-clip-text text-transparent">Leading Financial Teams</span>
          </h2>
          <p className="text-gray-400 text-lg">
            See how different professionals leverage SynergyAI to transform their workflow
          </p>
        </div>

        {/* Use Cases Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {useCases.map((useCase, index) => (
            <div 
              key={index}
              className="bg-surface rounded-2xl p-8 border border-border hover:border-synergy-ai-primary/30 transition-all duration-300 card-shadow"
            >
              <div className="flex items-start gap-6">
                <div className="bg-synergy-ai-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center">
                  {useCase.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-3">{useCase.title}</h3>
                  <p className="text-gray-400 mb-4">{useCase.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {useCase.metrics.map((metric, i) => (
                      <span 
                        key={i}
                        className="bg-synergy-ai-primary/10 text-synergy-ai-primary text-xs px-3 py-1 rounded-full border border-synergy-ai-primary/20"
                      >
                        {metric}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-gradient-to-br from-surface to-secondarySurface rounded-2xl p-8 border border-border card-shadow"
            >
              <div className="flex mb-6">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                ))}
              </div>
              
              <p className="text-gray-300 text-lg mb-6 italic">"{testimonial.text}"</p>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">{testimonial.author}</p>
                  <p className="text-gray-400 text-sm">{testimonial.position}</p>
                </div>
                <div className="bg-green-500/10 text-green-400 text-sm font-semibold px-3 py-1 rounded-full">
                  {testimonial.metric}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    </div>
  );
};

export default UseCasesSection;