// components/CtaSection.jsx
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar } from 'lucide-react';

interface CtaSectionProps {
  onAuthButtonClick: () => void;
}

const CtaSection = ({ onAuthButtonClick }: CtaSectionProps) => {
  return (
    <div className="bg-surface py-16 md:py-24" id="demo">
    <div className="px-4 sm:px-6 lg:px-8">

      <div className="section-container">
        <div className="bg-synergy-ai-primary/10 rounded-2xl p-8 md:p-12 relative overflow-hidden border border-synergy-ai-primary/20">
          {/* Abstract glow effects */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-synergy-ai-primary opacity-20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-synergy-ai-purple-light opacity-10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="lg:w-2/3 text-center lg:text-left">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Make Smarter M&A Decisions with SynergyAI
              </h2>
              <p className="text-gray-300 mb-6 text-lg max-w-2xl">
                Join leading investment firms and M&A teams that are already transforming their deal processes with AI-powered intelligence. Start your journey today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button onClick={onAuthButtonClick} className="bg-synergy-ai-primary hover:bg-synergy-ai-primary-hover text-white font-semibold py-3 px-6">
                    Request Demo
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button 
                    onClick={onAuthButtonClick}
                    variant="outline" 
                    className="border-synergy-ai-primary text-synergy-ai-primary hover:bg-synergy-ai-primary hover:text-white py-3 px-6"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule Consultation
                  </Button>
              </div>
            </div>
            
            <div className="lg:w-1/3">
              <div className="bg-background rounded-xl p-6 border border-border">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                  <h4 className="font-semibold text-white mb-2">Get Started Today</h4>
                  <p className="text-gray-400 text-sm mb-4">
                    See how SynergyAI can transform your investment process
                  </p>
                  <div className="space-y-2 text-xs text-gray-400">
                    <div className="flex justify-between">
                      <span>✓ No credit card required</span>
                    </div>
                    <div className="flex justify-between">
                      <span>✓ Personalized demo</span>
                    </div>
                    <div className="flex justify-between">
                      <span>✓ 30-day trial available</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>

  );
};

export default CtaSection;