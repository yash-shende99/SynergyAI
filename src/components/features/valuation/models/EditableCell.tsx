import { FC, useState, useEffect } from 'react';

interface EditableCellProps {
  // --- THIS IS THE FIX ---
  // The initialValue can now be a string OR a number (or null).
  initialValue: string | number | null;
  onSave: (newValue: string) => void;
  isText?: boolean;
}

const EditableCell: FC<EditableCellProps> = ({ initialValue, onSave, isText = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue?.toString() ?? '');

  // This effect ensures the cell updates if the underlying data changes
  useEffect(() => {
    setValue(initialValue?.toString() ?? '');
  }, [initialValue]);

  const handleSave = () => {
    onSave(value);
    setIsEditing(false);
  };

  const alignmentClass = isText ? 'text-left' : 'text-right';

  if (isEditing) {
    return (
      <input 
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
        autoFocus
        className={`w-full bg-background border border-primary ring-1 ring-primary rounded-md p-1 text-sm text-slate-300 outline-none ${alignmentClass}`}
      />
    );
  }

  return (
    <span 
      onClick={() => setIsEditing(true)}
      className={`block p-1 text-sm cursor-pointer rounded-md border border-transparent hover:border-border ${alignmentClass} ${isText ? 'text-secondary hover:text-white' : 'text-slate-300'}`}
    >
      {/* Conditionally format the display value */}
      {isText ? value : (typeof initialValue === 'number' ? initialValue.toLocaleString('en-IN') : '0')}
    </span>
  );
};

export default EditableCell;