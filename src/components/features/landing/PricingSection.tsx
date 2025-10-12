// components/PricingSection.jsx
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Check } from 'lucide-react';

const PricingSection = () => {
  const [isAnnual, setIsAnnual] = useState(true);
  
  const plans = [
    {
      name: 'Starter',
      monthlyPrice: 19, 
      annualPrice: 15,
      description: 'Perfect for individual analysts and small teams',
      features: [
        '2 team members',
        '20GB cloud storage',
        'Basic analytics',
        'Email support',
        '1 project'
      ],
      isPopular: false,
      ctaText: 'Start with Starter'
    },
    {
      name: 'Professional',
      monthlyPrice: 49,
      annualPrice: 39,
      description: 'Great for growing investment teams',
      features: [
        '10 team members',
        '100GB cloud storage',
        'Advanced analytics',
        'Priority email support',
        'Unlimited projects',
        'API access',
        'Custom integration'
      ],
      isPopular: true,
      ctaText: 'Start with Pro'
    },
    {
      name: 'Enterprise',
      monthlyPrice: 99,
      annualPrice: 79,
      description: 'For large financial organizations with complex needs',
      features: [
        'Unlimited team members',
        '500GB cloud storage',
        'Advanced analytics & reporting',
        '24/7 dedicated support',
        'Unlimited projects',
        'Full API access',
        'Custom integration',
        'SSO Authentication',
        'Dedicated account manager'
      ],
      isPopular: false,
      ctaText: 'Contact Sales'
    }
  ];

  return (
    <div className="bg-gradient-to-b from-surface to-background py-16 md:py-24" id="pricing">
    <div className="px-4 sm:px-6 lg:px-8">

      <div className="section-container">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Simple, <span className="bg-gradient-to-r from-synergy-ai-primary to-synergy-ai-purple-light bg-clip-text text-transparent">Transparent</span> Pricing
          </h2>
          <p className="text-gray-400 mb-8">
            Choose the plan that fits your business needs. No hidden fees, no surprises.
          </p>
          
          {/* Pricing toggle */}
          <div className="flex items-center justify-center space-x-4 mb-12">
            <span className={`text-sm font-medium ${isAnnual ? 'text-synergy-ai-primary' : 'text-gray-400'}`}>
              Annual <span className="text-xs text-synergy-ai-primary">(Save 20%)</span>
            </span>
            <button 
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors ${isAnnual ? 'bg-synergy-ai-primary' : 'bg-gray-600'}`}
            >
              <span 
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isAnnual ? 'translate-x-7' : 'translate-x-1'}`}
              />
            </button>
            <span className={`text-sm font-medium ${!isAnnual ? 'text-synergy-ai-primary' : 'text-gray-400'}`}>
              Monthly
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`rounded-2xl p-8 transition-all duration-300 ${
                plan.isPopular 
                  ? 'bg-synergy-ai-primary/10 border border-synergy-ai-primary/30 transform hover:-translate-y-2' 
                  : 'bg-surface border border-border transform hover:-translate-y-1'
              }`}
            >
              {plan.isPopular && (
                <span className="bg-synergy-ai-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase mb-4 inline-block">
                  Most Popular
                </span>
              )}
              
              <h3 className="text-2xl font-bold mb-2 text-white">{plan.name}</h3>
              <p className="text-gray-400 mb-6">{plan.description}</p>
              
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">
                  ${isAnnual ? plan.annualPrice : plan.monthlyPrice}
                </span>
                <span className="text-gray-400"> /month</span>
              </div>
              
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <Check className="h-5 w-5 text-synergy-ai-primary mr-2 shrink-0" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                className={`w-full ${
                  plan.isPopular 
                    ? 'bg-synergy-ai-primary hover:bg-synergy-ai-primary-hover text-white' 
                    : 'bg-surface border border-synergy-ai-primary/30 hover:border-synergy-ai-primary text-white'
                }`}
              >
                {plan.ctaText}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
    </div>
  );
};

export default PricingSection;