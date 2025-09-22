import { FC } from 'react';

interface VariableSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  unit: string;
}

const VariableSlider: FC<VariableSliderProps> = ({ label, value, onChange, min, max, step, unit }) => {
  const colorClass = value > 0 ? 'text-green-400' : value < 0 ? 'text-red-400' : 'text-white';
  return (
    <div className="py-2 border-b border-border/50">
      <div className="flex justify-between items-center mb-1">
        <label className="text-sm text-secondary">{label}</label>
        <span className={`text-sm font-semibold ${colorClass}`}>
          {value > 0 ? '+' : ''}{value}{unit}
        </span>
      </div>
      <input 
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer"
      />
    </div>
  );
};

export default VariableSlider;