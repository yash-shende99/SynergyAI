const GraphLegendPanel = () => (
  <div>
    <h4 className="text-sm font-semibold text-secondary mb-2">Legend</h4>
    <div className="p-3 bg-background/50 rounded-lg space-y-2 text-xs">
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div><span className="text-slate-300">Company</span></div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500"></div><span className="text-slate-300">Executive</span></div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500"></div><span className="text-slate-300">Deal</span></div>
    </div>
  </div>
);
export default GraphLegendPanel;