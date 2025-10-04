'use client';

import { FC, useState } from 'react';
import { ChevronDown, ChevronRight, FileText, Search, Filter, Download, Share2 } from 'lucide-react';

const ContextSidebar: FC = () => {
  const [expandedSections, setExpandedSections] = useState({
    sources: true,
    suggestions: false,
    metadata: true
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev]
    }));
  };

  // Mock data - in real app, this would come from props or API
  const documentSources = [
    {
      name: "Financial Statements FY2024",
      type: "PDF",
      size: "2.4 MB",
      category: "Financials",
      relevance: "High"
    },
    {
      name: "Market Analysis Report",
      type: "PDF",
      size: "1.8 MB",
      category: "Market Research",
      relevance: "High"
    },
    {
      name: "Due Diligence Findings",
      type: "DOCX",
      size: "3.1 MB",
      category: "Legal",
      relevance: "Medium"
    },
    {
      name: "Competitor Landscape",
      type: "XLSX",
      size: "4.2 MB",
      category: "Strategy",
      relevance: "Medium"
    },
    {
      name: "Management Team Profiles",
      type: "PDF",
      size: "1.2 MB",
      category: "HR",
      relevance: "Low"
    }
  ];

  const aiSuggestions = [
    {
      type: "analysis",
      text: "Consider deeper analysis of customer concentration risk",
      priority: "High"
    },
    {
      type: "data",
      text: "Missing quarterly breakdown for revenue projections",
      priority: "Medium"
    },
    {
      type: "comparison",
      text: "Compare with recent M&A transactions in sector",
      priority: "Medium"
    }
  ];

  const metadata = {
    generated: new Date().toLocaleDateString(),
    documentsAnalyzed: 24,
    dataPoints: "1,847",
    confidence: "92%",
    lastUpdated: "2 hours ago"
  };

  return (
    <div className="p-6 rounded-xl border border-border bg-surface/50 h-[80vh] sticky top-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-white text-lg">Context & Sources</h3>
        <div className="flex gap-2">
          <button className="p-2 hover:bg-surface rounded transition-colors">
            <Search size={16} />
          </button>
          <button className="p-2 hover:bg-surface rounded transition-colors">
            <Filter size={16} />
          </button>
        </div>
      </div>

      {/* Sources Section */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('sources')}
          className="flex items-center justify-between w-full text-left mb-3"
        >
          <span className="font-semibold text-white">Document Sources ({documentSources.length})</span>
          {expandedSections.sources ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        
        {expandedSections.sources && (
          <div className="space-y-3">
            {documentSources.map((doc, index) => (
              <div key={index} className="p-3 rounded-lg bg-surface/30 border border-border hover:border-primary/50 transition-colors group">
                <div className="flex items-start gap-3">
                  <FileText size={16} className="text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white text-sm font-medium truncate">{doc.name}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        doc.relevance === 'High' ? 'bg-green-500/20 text-green-400' :
                        doc.relevance === 'Medium' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {doc.relevance}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-secondary">
                      <span>{doc.type}</span>
                      <span>{doc.size}</span>
                      <span>{doc.category}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="text-xs flex items-center gap-1 text-secondary hover:text-primary transition-colors">
                    <Download size={12} />
                    Download
                  </button>
                  <button className="text-xs flex items-center gap-1 text-secondary hover:text-primary transition-colors">
                    <Share2 size={12} />
                    Share
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Suggestions Section */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('suggestions')}
          className="flex items-center justify-between w-full text-left mb-3"
        >
          <span className="font-semibold text-white">AI Suggestions ({aiSuggestions.length})</span>
          {expandedSections.suggestions ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        
        {expandedSections.suggestions && (
          <div className="space-y-3">
            {aiSuggestions.map((suggestion, index) => (
              <div key={index} className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-start gap-2">
                  <div className={`w-2 h-2 rounded-full mt-1.5 ${
                    suggestion.priority === 'High' ? 'bg-red-400' :
                    suggestion.priority === 'Medium' ? 'bg-amber-400' :
                    'bg-blue-400'
                  }`}></div>
                  <span className="text-sm text-blue-200">{suggestion.text}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Metadata Section */}
      <div>
        <button
          onClick={() => toggleSection('metadata')}
          className="flex items-center justify-between w-full text-left mb-3"
        >
          <span className="font-semibold text-white">Analysis Metadata</span>
          {expandedSections.metadata ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        
        {expandedSections.metadata && (
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="space-y-2">
              <div>
                <span className="text-secondary">Generated:</span>
                <div className="text-white">{metadata.generated}</div>
              </div>
              <div>
                <span className="text-secondary">Documents:</span>
                <div className="text-white">{metadata.documentsAnalyzed} analyzed</div>
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <span className="text-secondary">Data Points:</span>
                <div className="text-white">{metadata.dataPoints}</div>
              </div>
              <div>
                <span className="text-secondary">Confidence:</span>
                <div className="text-green-400">{metadata.confidence}</div>
              </div>
            </div>
            <div className="col-span-2">
              <span className="text-secondary">Last Updated:</span>
              <div className="text-white">{metadata.lastUpdated}</div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex gap-2">
          <button className="flex-1 bg-primary hover:bg-primary/90 text-white text-sm py-2 px-3 rounded transition-colors">
            Refresh Analysis
          </button>
          <button className="flex-1 bg-surface hover:bg-surface/80 text-white text-sm py-2 px-3 rounded transition-colors border border-border">
            Export Context
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContextSidebar;