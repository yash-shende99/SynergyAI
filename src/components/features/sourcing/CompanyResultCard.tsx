import { FC } from 'react';
import { Company } from '../../../types';
import { handleLogoError } from '../../../lib/utils';

interface CompanyResultCardProps {
  company: Company;
  isSelected: boolean;
  onSelect: () => void;
}

const CompanyResultCard: FC<CompanyResultCardProps> = ({ company, isSelected, onSelect }) => {
  return (
    <button 
      onClick={onSelect}
      className={`p-4 rounded-lg border bg-surface/50 text-left transition-all duration-200 ${
        isSelected ? 'border-primary ring-2 ring-primary/50' : 'border-border hover:border-secondary'
      }`}
    >
      <div className="flex items-center gap-4">
        <img 
          src={company.logoUrl || '/placeholder-logo.svg'} 
          alt={`${company.name} logo`} 
          className="h-10 w-10 rounded-md bg-white p-1 object-contain"
          onError={handleLogoError}
        />
        <div>
          <h4 className="font-bold text-white">{company.name}</h4>
          <p className="text-sm text-secondary">{company.sector}</p>
        </div>
      </div>
      <div className="mt-4 flex justify-between text-sm">
        <div>
          <p className="text-xs text-secondary">Revenue (FY24)</p>
          <p className="font-semibold text-white">₹{company.revenue} Cr</p>
        </div>
        <div>
          <p className="text-xs text-secondary">Employees</p>
          <p className="font-semibold text-white">{company.employees.toLocaleString('en-IN')}</p>
        </div>
      </div>
    </button>
  );
};

export default CompanyResultCard;