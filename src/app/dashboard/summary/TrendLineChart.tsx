const TrendLineChart = () => {
  return (
    <div className="p-4 bg-surface/80 border border-border rounded-xl backdrop-blur-sm">
      <h4 className="text-sm font-bold text-white mb-2">Deal Flow (Last 6 Months)</h4>
      <div className="flex items-center justify-center h-32 bg-background/50 rounded-lg">
        <p className="text-secondary text-sm">[ECharts Trend Line Chart]</p>
      </div>
    </div>
  );
};
export default TrendLineChart;