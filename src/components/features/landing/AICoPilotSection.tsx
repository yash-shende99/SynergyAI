// components/AICoPilotSection.jsx
import React from 'react';
import { Button } from "@/components/ui/button";
import { MessageSquare, Zap, Clock, Brain } from 'lucide-react';

const AICoPilotSection = () => {
  return (
    
    <div className="bg-background py-16 md:py-24" id="ai-copilot">
      <div className="px-4 sm:px-6 lg:px-8">
      <div className="section-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block bg-synergy-ai-primary/10 text-synergy-ai-primary px-4 py-2 rounded-full text-sm font-medium mb-4 border border-synergy-ai-primary/20">
              AI Co-Pilot
            </span>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Your <span className="bg-gradient-to-r from-synergy-ai-primary to-synergy-ai-purple-light bg-clip-text text-transparent">24/7 Financial Assistant</span>
            </h2>
            
            <p className="text-gray-300 text-lg mb-8">
              Ask complex financial questions in natural language and get contextual, data-backed answers instantly. 
              SynergyAI Co-Pilot understands your deals, your data, and your domain.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-4">
                <Zap className="h-6 w-6 text-yellow-400 mt-1" />
                <div>
                  <h4 className="font-semibold text-white mb-1">Instant Insights</h4>
                  <p className="text-gray-400">Get answers to complex financial queries in seconds</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <Brain className="h-6 w-6 text-synergy-ai-primary mt-1" />
                <div>
                  <h4 className="font-semibold text-white mb-1">Context-Aware</h4>
                  <p className="text-gray-400">Understands your specific deals and investment criteria</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <Clock className="h-6 w-6 text-green-400 mt-1" />
                <div>
                  <h4 className="font-semibold text-white mb-1">Always Available</h4>
                  <p className="text-gray-400">24/7 access to AI-powered financial analysis</p>
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-lg p-6 border border-border mb-6">
              <h4 className="font-semibold text-white mb-3">Try asking:</h4>
              <div className="space-y-2">
                <p className="text-gray-400 text-sm">"Show me top 5 undervalued tech firms with EBITDA growth &gt;20%"</p>
                <p className="text-gray-400 text-sm">"Analyze synergy potential between Company A and Company B"</p>
                <p className="text-gray-400 text-sm">"What are the key risks in this acquisition target?"</p>
              </div>
            </div>

            <Button className="bg-synergy-ai-primary hover:bg-synergy-ai-primary-hover text-white">
              <MessageSquare className="mr-2 h-4 w-4" />
              Try AI Co-Pilot
            </Button>
          </div>

          <div className="relative">
            <div className="bg-surface rounded-2xl border border-border overflow-hidden card-shadow">
              {/* Chat header */}
              <div className="bg-gradient-to-r from-synergy-ai-primary to-synergy-ai-purple-light p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <MessageSquare className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">SynergyAI Co-Pilot</h3>
                    <p className="text-white/80 text-sm">Online • Ready to assist</p>
                  </div>
                </div>
              </div>
              
              {/* Chat messages */}
              <div className="p-6 space-y-4 h-96 overflow-y-auto">
                <div className="flex justify-start">
                  <div className="bg-secondarySurface rounded-2xl rounded-tl-none p-4 max-w-[80%]">
                    <p className="text-white">Show me undervalued companies in the SaaS sector with strong growth metrics</p>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <div className="bg-synergy-ai-primary rounded-2xl rounded-tr-none p-4 max-w-[80%]">
                    <p className="text-white">Based on current analysis, I've found 3 promising SaaS companies that appear undervalued:</p>
                    <div className="mt-3 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-purple-100">CloudTech Inc.</span>
                        <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">+22% Upside</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-purple-100">DataSoft Corp.</span>
                        <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">+18% Upside</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-purple-100">SecureSaaS Ltd.</span>
                        <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">+15% Upside</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-start">
                  <div className="bg-secondarySurface rounded-2xl rounded-tl-none p-4 max-w-[80%]">
                    <p className="text-white">What are the key risks for CloudTech Inc.?</p>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <div className="bg-synergy-ai-primary rounded-2xl rounded-tr-none p-4 max-w-[80%]">
                    <p className="text-white">Key risks identified for CloudTech Inc.:</p>
                    <ul className="mt-2 space-y-1 text-purple-100 text-sm">
                      <li>• High customer concentration (30% revenue from top 2 clients)</li>
                      <li>• Increasing competition in cloud security space</li>
                      <li>• Dependency on key management personnel</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              {/* Input area */}
              <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Ask about deals, valuations, or risks..."
                    className="flex-1 bg-secondarySurface border border-border rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-synergy-ai-primary"
                  />
                  <Button className="bg-synergy-ai-primary hover:bg-synergy-ai-primary-hover">
                    <MessageSquare className="h-4 w-4" />
                  </Button>
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

export default AICoPilotSection;