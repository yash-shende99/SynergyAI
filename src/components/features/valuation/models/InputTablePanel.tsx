'use client';

import { FC } from 'react';
import SpreadsheetRow from './SpreadsheetRow';
import { ModelRow } from '../../../../types';
import {Button} from '../../../ui/button';
import { Plus } from 'lucide-react';

interface InputTablePanelProps {
  modelData: ModelRow[];
  setModelData: React.Dispatch<React.SetStateAction<ModelRow[]>>;
}

const InputTablePanel: FC<InputTablePanelProps> = ({ modelData, setModelData }) => {
  const handleValueChange = (rowIndex: number, yearIndex: number, rawValue: string) => {
    // ... (existing auto-calculation logic remains the same)
    if (rawValue && !/^-?\d*\.?\d*$/.test(rawValue)) return;
    const value = parseFloat(rawValue) || 0;
    const newData = modelData.map((row, rIndex) => 
      rIndex === rowIndex ? { ...row, values: row.values.map((v, yIndex) => yIndex === yearIndex ? value : v) } : row
    );
    const getVal = (id: string, year: number) => newData.find(r => r.id === id)?.values[year] || 0;
    for (let i = 0; i < 4; i++) {
        const revenue = getVal('rev', i);
        const cogs = getVal('cogs', i);
        const sga = getVal('sga', i);
        const grossProfit = revenue - cogs;
        const ebitda = grossProfit - sga;
        const ebitdaMargin = revenue !== 0 ? (ebitda / revenue) * 100 : 0;
        newData.find(r => r.id === 'gp')!.values[i] = grossProfit;
        newData.find(r => r.id === 'ebitda')!.values[i] = ebitda;
        newData.find(r => r.id === 'ebitdaMargin')!.values[i] = ebitdaMargin;
    }
    setModelData(newData);
  };

  const handleLabelChange = (rowIndex: number, newLabel: string) => { /* ... same as before ... */ };
  
  // --- THIS IS THE NEW DELETE FUNCTION ---
  const handleDeleteRow = (rowIndex: number) => {
    setModelData(prevData => prevData.filter((_, index) => index !== rowIndex));
  };

  const addLineItem = () => {
    const newItem: ModelRow = { id: `custom-${Date.now()}`, label: 'New Line Item', type: 'INPUT', values: [0, 0, 0, 0] };
    setModelData(prevData => [...prevData, newItem]);
  };
  
  return (
    <div className="p-4 rounded-xl border border-border bg-surface/50 h-full flex flex-col">
      <input defaultValue="Live Model: Project Helios DCF" className="font-bold text-white bg-transparent text-lg focus:outline-none focus:bg-surface/50 rounded-md px-2 py-1 mb-4"/>
      <div className="flex-1 overflow-auto">
        <div className="min-w-[800px]">
          <div className="grid grid-cols-6 gap-2 text-xs font-semibold text-secondary sticky top-0 bg-surface/80 backdrop-blur-sm z-10">
            <div className="p-2 col-span-2">Metric</div><div className="p-2 text-right">2024A</div><div className="p-2 text-right">2025E</div>
            <div className="p-2 text-right">2026E</div><div className="p-2 text-right">2027E</div>
          </div>
          <div className="space-y-1 mt-2">
            {modelData.map((row, rowIndex) => (
              <SpreadsheetRow 
                key={row.id} 
                row={row} 
                onValueChange={(yearIndex, value) => handleValueChange(rowIndex, yearIndex, value)}
                onLabelChange={(newLabel) => handleLabelChange(rowIndex, newLabel)}
                // We now pass down the delete handler
                onDelete={() => handleDeleteRow(rowIndex)}
              />
            ))}
          </div>
          <Button onClick={addLineItem} variant="ghost" size="sm" className="mt-4"><Plus size={16} className="mr-2"/> Add New Line Item</Button>
        </div>
      </div>
    </div>
  );
};

export default InputTablePanel;