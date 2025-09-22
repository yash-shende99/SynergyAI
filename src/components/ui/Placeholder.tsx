import { FC, ElementType } from 'react';
import { LucideIcon } from 'lucide-react';

interface PlaceholderProps {
  Icon: LucideIcon;
  title: string;
  subtitle: string;
}

const Placeholder: FC<PlaceholderProps> = ({ Icon, title, subtitle }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-8 bg-surface/50 rounded-xl border-2 border-dashed border-border text-center">
      <div className="flex items-center justify-center h-16 w-16 bg-surface rounded-full border border-border mb-4">
        <Icon className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-xl font-bold text-white">{title}</h3>
      <p className="mt-2 max-w-md text-secondary">{subtitle}</p>
    </div>
  );
};

export default Placeholder;