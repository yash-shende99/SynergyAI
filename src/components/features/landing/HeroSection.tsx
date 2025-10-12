// components/HeroSection.jsx
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from 'lucide-react';

interface HeroSectionProps {
  onAuthButtonClick: () => void;
}

const HeroSection = ({ onAuthButtonClick }: HeroSectionProps) => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    
    <div className="relative bg-gradient-to-b from-background to-surface overflow-hidden min-h-[90vh] flex items-center" id="hero">
      <div className="px-4 sm:px-6 lg:px-8">
      {/* Animated background elements */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-synergy-ai-primary opacity-10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-synergy-ai-purple-light opacity-15 rounded-full blur-[100px]"></div>
      
      <div className="section-container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in">
            <span className="inline-block bg-synergy-ai-primary/10 text-synergy-ai-primary px-4 py-2 rounded-full text-sm font-medium mb-6 border border-synergy-ai-primary/20">
              AI-Powered M&A Intelligence
            </span>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
              Transform the Way You <span className="bg-gradient-to-r from-synergy-ai-primary to-synergy-ai-purple-light bg-clip-text text-transparent">Discover, Value, and Evaluate</span> Companies
            </h1>
            
            <p className="text-lg md:text-xl mb-8 text-gray-300 max-w-2xl">
              SynergyAI is an AI-powered M&A intelligence platform that helps analysts and investors uncover high-potential deals, predict valuations, and assess risks — all from one unified dashboard.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button onClick={onAuthButtonClick} className="bg-synergy-ai-primary hover:bg-synergy-ai-primary-hover text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200">
                  Sign Up
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button 
                  onClick={() => scrollToSection('how-it-works')}
                  variant="outline" 
                  className="border-synergy-ai-primary text-synergy-ai-primary hover:bg-synergy-ai-primary hover:text-white"
                >
                  <Play className="mr-2 h-4 w-4" />
                  See How It Works
                </Button>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                AI-Driven Accuracy
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                Real-time Insights
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                Enterprise Security
              </div>
            </div>
          </div>
          
          <div className="animate-fade-in" style={{animationDelay: '0.3s'}}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-synergy-ai-primary to-synergy-ai-purple-light blur-xl opacity-20 rounded-2xl"></div>
              <div className="relative bg-surface rounded-2xl border border-synergy-ai-primary/20 p-4 card-shadow transform transition-all duration-500 hover:scale-[1.02]">
                <img 
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&h=700&q=80"
                  alt="SynergyAI Dashboard"
                  className="rounded-lg w-full"
                />
                <div className="absolute bottom-6 left-6 bg-synergy-ai-primary/90 backdrop-blur-sm px-4 py-2 rounded-lg text-white text-sm font-medium">
                  AI Valuation Dashboard
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

export default HeroSection;