import { FC, ReactNode } from 'react';

interface SettingsToggleProps {
  icon: ReactNode;
  label: string;
  description: string;
  isChecked: boolean;
  onToggle: () => void;
}

const SettingsToggle: FC<SettingsToggleProps> = ({ icon, label, description, isChecked, onToggle }) => (
    <div className="flex items-start justify-between p-3 rounded-lg hover:bg-surface">
        <div className="flex items-start gap-3">
            <div className="text-primary mt-1">{icon}</div>
            <div>
                <p className="font-medium text-white">{label}</p>
                <p className="text-xs text-secondary">{description}</p>
            </div>
        </div>
        <button onClick={onToggle} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isChecked ? 'bg-primary' : 'bg-border'}`}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isChecked ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    </div>
);
export default SettingsToggle;
