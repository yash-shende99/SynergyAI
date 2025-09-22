import { FC, ReactNode } from 'react';

interface FilterGroupProps {
  title: string;
  children: ReactNode;
}

const FilterGroup: FC<FilterGroupProps> = ({ title, children }) => {
  return (
    <div className="py-2 border-b border-border last:border-b-0">
      <h4 className="font-semibold text-white text-sm mb-2">{title}</h4>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
};

export default FilterGroup;