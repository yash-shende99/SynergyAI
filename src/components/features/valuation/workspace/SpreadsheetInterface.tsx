import SpreadsheetRow from './SpreadsheetRow';

const SpreadsheetInterface = () => {
  return (
    <div className="p-4 rounded-xl border border-border bg-surface/50 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-white">Discounted Cash Flow (DCF) Model</h3>
        {/* Toolbar would go here */}
      </div>
      <div className="flex-1 overflow-auto">
        <div className="min-w-[800px]">
          {/* Header Row */}
          <div className="grid grid-cols-6 gap-2 text-xs font-semibold text-secondary sticky top-0 bg-surface/80 backdrop-blur-sm z-10">
            <div className="p-2 col-span-2">Metric</div>
            <div className="p-2 text-right">2024A</div>
            <div className="p-2 text-right">2025E</div>
            <div className="p-2 text-right">2026E</div>
            <div className="p-2 text-right">2027E</div>
          </div>
          {/* Data Rows */}
          <div className="space-y-1 mt-2">
            <SpreadsheetRow label="Revenue" values={[500, 550, 605, 665]} isInput />
            <SpreadsheetRow label="Growth Rate" values={['-', '10.0%', '10.0%', '10.0%']} isPercentage isInput/>
            <SpreadsheetRow label="COGS" values={[200, 220, 242, 266]} isInput/>
            <SpreadsheetRow label="Gross Profit" values={[300, 330, 363, 399]} isFormula/>
            <SpreadsheetRow label="EBITDA" values={[150, 165, 182, 200]} isFormula/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpreadsheetInterface;