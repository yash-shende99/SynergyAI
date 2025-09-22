import { FC } from 'react';

interface SpreadsheetRowProps {
  label: string;
  values: (string | number)[];
  isInput?: boolean;
  isFormula?: boolean;
  isPercentage?: boolean;
}

const SpreadsheetRow: FC<SpreadsheetRowProps> = ({ label, values, isInput, isFormula, isPercentage }) => {
  const labelStyle = isFormula ? 'font-semibold text-white' : 'text-secondary';
  
  return (
    <div className={`grid grid-cols-6 gap-2 items-center rounded-md ${isInput ? 'hover:bg-surface/50' : ''}`}>
      <div className={`p-2 col-span-2 text-sm ${labelStyle}`}>{label}</div>
      {values.map((val, index) => (
        <div key={index} className="p-1">
          {isInput ? (
            <input 
              type="text"
              defaultValue={val}
              className={`w-full bg-background/50 border border-transparent hover:border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-md p-1 text-right text-sm ${isPercentage ? 'text-green-400' : 'text-slate-300'}`}
            />
          ) : (
            <span className={`block p-1 text-right text-sm ${isPercentage ? 'text-green-400' : 'text-slate-300'}`}>
              {val}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

export default SpreadsheetRow;