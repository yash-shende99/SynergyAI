import { FC } from 'react';
import { ModelRow } from '../../../../types';
import EditableCell from './EditableCell';
import { Trash2 } from 'lucide-react'; // Import the trash icon

interface SpreadsheetRowProps {
  row: ModelRow;
  onValueChange: (yearIndex: number, value: string) => void;
  onLabelChange: (newLabel: string) => void;
  onDelete: () => void; // Add the delete prop
}

const SpreadsheetRow: FC<SpreadsheetRowProps> = ({ row, onValueChange, onLabelChange, onDelete }) => {
  const labelStyle = row.type !== 'INPUT' ? 'font-semibold text-white' : 'text-secondary';
  
  // --- NEW LOGIC: Determine if the row is a custom, deletable one ---
  const isDeletable = row.id.startsWith('custom-');

  return (
    <div className="grid grid-cols-6 gap-2 items-center rounded-md hover:bg-surface/50 group">
      <div className="p-2 col-span-2 text-sm flex items-center gap-2">
        {row.type === 'INPUT' ? (
          <EditableCell initialValue={row.label} onSave={onLabelChange} isText={true} />
        ) : (
          <span className={labelStyle}>{row.label}</span>
        )}
        
        {/* --- NEW FEATURE: The Delete Button --- */}
        {isDeletable && (
          <button 
            onClick={onDelete} 
            className="text-secondary hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {row.values.map((val, yearIndex) => (
        <div key={yearIndex} className="p-1">
          {row.type === 'INPUT' ? (
            <EditableCell initialValue={val} onSave={(newValue) => onValueChange(yearIndex, newValue)} />
          ) : (
            <span className={`block p-1 text-right text-sm ${ val !== null && val < 0 ? 'text-red-400' : row.type === 'PERCENTAGE' ? 'text-green-400' : 'text-slate-300' }`}>
              {row.type === 'PERCENTAGE' ? `${val?.toFixed(1)}%` : val?.toLocaleString('en-IN') ?? '-'}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

export default SpreadsheetRow;