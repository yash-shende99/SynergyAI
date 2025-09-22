import { FC } from 'react';
import { Company } from '../../../../types';
import { X } from 'lucide-react';
import { supabase } from '../../../../lib/supabaseClient';

interface CompanyAlertCardProps {
  company: Company;
  watchlistId: string;
  onCompanyRemoved: () => void;
}

const CompanyAlertCard: FC<CompanyAlertCardProps> = ({ company, watchlistId, onCompanyRemoved }) => {
  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    try {
      const response = await fetch(`http://localhost:8000/api/watchlists/${watchlistId}/companies/${company.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      if (!response.ok) throw new Error('Failed to remove company');
      onCompanyRemoved();
    } catch (error) {
      console.error(error);
      alert('Failed to remove company.');
    }
  };

  return (
    <div className="p-4 rounded-lg border border-border bg-surface/80 text-left relative group">
      <button onClick={handleRemove} className="absolute top-1 right-1 p-1 rounded-full bg-background/50 text-secondary hover:text-white opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <X size={14} />
      </button>
      <div className="flex items-center gap-4">
        <img src={company.logoUrl} alt={`${company.name} logo`} className="h-10 w-10 rounded-md bg-white p-1"/>
        <div>
          <h4 className="font-bold text-white">{company.name}</h4>
          <p className="text-sm text-secondary">{company.sector}</p>
        </div>
      </div>
    </div>
  );
};
export default CompanyAlertCard;