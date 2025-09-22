import { Share2 } from 'lucide-react';

const KnowledgeGraphMiniView = () => {
  return (
    <div className="p-4 bg-surface/80 border border-border rounded-xl backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-2">
        <Share2 className="h-4 w-4 text-primary" />
        <h4 className="text-sm font-bold text-white">Knowledge Graph</h4>
      </div>
      <div className="flex items-center justify-center h-24 bg-background/50 rounded-lg">
        <p className="text-secondary text-sm">[Graph Visualization Highlighting Risky Connections]</p>
      </div>
    </div>
  );
};

export default KnowledgeGraphMiniView;