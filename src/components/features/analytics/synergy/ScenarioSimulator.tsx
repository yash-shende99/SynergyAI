const ScenarioSimulator = () => {
    return (
        <div className="p-4 rounded-xl border border-border bg-surface/50">
            <h3 className="font-bold text-white mb-4">Scenario Simulator</h3>
            <div className="space-y-2">
                <label className="text-xs text-secondary">Realization Rate (80%)</label>
                <input type="range" min="50" max="100" defaultValue="80" className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer"/>
            </div>
            <div className="mt-4 text-center">
                <p className="text-secondary text-sm">New Score: <span className="font-bold text-2xl text-amber-400">65</span></p>
            </div>
        </div>
    );
};
export default ScenarioSimulator;