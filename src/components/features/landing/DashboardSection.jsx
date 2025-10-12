// components/DashboardSection.jsx
import React from 'react';
import { Button } from "@/components/ui/button";
import { Eye, BarChart3, TrendingUp, AlertTriangle } from 'lucide-react';

const DashboardSection = () => {
  return (
    <div className="bg-gradient-to-b from-surface to-background py-16 md:py-24" id="dashboard">
    <div className="px-4 sm:px-6 lg:px-8">

      <div className="section-container">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            All Your Intelligence, <span className="bg-gradient-to-r from-synergy-ai-primary to-synergy-ai-purple-light bg-clip-text text-transparent">In One Place</span>
          </h2>
          <p className="text-gray-400 text-lg">
            A unified dashboard that brings together deal sourcing, valuation, risk analysis, and market insights
          </p>
        </div>

        <div className="relative bg-surface rounded-2xl border border-border overflow-hidden card-shadow">
          {/* Dashboard mockup */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div className="text-sm text-gray-400">SynergyAI Dashboard</div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm">Live</span>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Dashboard grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Market Sentiment */}
              <div className="bg-secondarySurface rounded-xl p-6 border border-border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white">Market Sentiment</h3>
                  <TrendingUp className="h-5 w-5 text-green-400" />
                </div>
                <div className="text-2xl font-bold text-green-400 mb-2">78.5</div>
                <div className="text-sm text-gray-400">Bullish • Up 2.3% this week</div>
              </div>

              {/* Deal Pipeline */}
              <div className="bg-secondarySurface rounded-xl p-6 border border-border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white">Deal Pipeline</h3>
                  <BarChart3 className="h-5 w-5 text-synergy-ai-primary" />
                </div>
                <div className="text-2xl font-bold text-white mb-2">24</div>
                <div className="text-sm text-gray-400">Active deals • 8 high-potential</div>
              </div>

              {/* Risk Alerts */}
              <div className="bg-secondarySurface rounded-xl p-6 border border-border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white">Risk Alerts</h3>
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                </div>
                <div className="text-2xl font-bold text-red-400 mb-2">3</div>
                <div className="text-sm text-gray-400">Requires attention</div>
              </div>
            </div>

            {/* Valuation chart area */}
            <div className="bg-secondarySurface rounded-xl p-6 border border-border">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-white">Valuation Trends</h3>
                <div className="flex gap-2">
                  <div className="bg-synergy-ai-primary text-white text-xs px-3 py-1 rounded-full">Tech</div>
                  <div className="bg-surface text-gray-300 text-xs px-3 py-1 rounded-full">Healthcare</div>
                  <div className="bg-surface text-gray-300 text-xs px-3 py-1 rounded-full">Finance</div>
                </div>
              </div>
              
              {/* Mock chart */}
              <div className="h-48 bg-synergy-ai-primary/10 rounded-lg border border-border flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-synergy-ai-primary mx-auto mb-2" />
                  <p className="text-gray-400">Interactive valuation chart</p>
                  <p className="text-gray-500 text-sm">Showing AI-predicted growth trajectories</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <Button className="bg-synergy-ai-primary hover:bg-synergy-ai-primary-hover text-white">
            <Eye className="mr-2 h-4 w-4" />
            Explore Interactive Demo
          </Button>
        </div>
      </div>
    </div>
    </div>

  );
};

export default DashboardSection;