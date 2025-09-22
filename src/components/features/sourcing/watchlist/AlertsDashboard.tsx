import { FC } from 'react';
import { Company, WatchlistWithCount } from '../../../../types';
import CompanyAlertCard from './CompanyAlertCard';
import { Loader2 } from 'lucide-react';

interface AlertsDashboardProps {
  watchlist: WatchlistWithCount | null;
  companies: Company[];
  isLoading: boolean;
  onCompanyChange: () => void;
}

const AlertsDashboard: FC<AlertsDashboardProps> = ({ watchlist, companies, isLoading, onCompanyChange }) => {
  if (!watchlist) { 
    return (
      <div className="p-4 rounded-xl border border-border bg-surface/50 h-full flex items-center justify-center">
        <p className="text-secondary">Select or create a watchlist to begin.</p>
      </div>
    );
  }
  
  return (
    <div className="p-4 rounded-xl border border-border bg-surface/50 h-full">
      <h3 className="font-bold text-white mb-4">{watchlist.name} ({isLoading ? '...' : companies.length})</h3>
      {isLoading ? ( 
        <div className="flex justify-center items-center h-full">
          <Loader2 className="h-6 w-6 animate-spin text-primary"/>
        </div>
      ) : companies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {companies.map(company => (
            <CompanyAlertCard 
              key={company.id} 
              company={company} 
              watchlistId={watchlist.id} 
              onCompanyRemoved={onCompanyChange} 
            />
          ))}
        </div>
      ) : ( 
        <div className="text-center pt-16 text-secondary">
          <p className="font-semibold">This watchlist is empty.</p>
          <p className="text-sm mt-1">Add companies from the "Search" page.</p>
        </div> 
      )}
    </div>
  );
};
export default AlertsDashboard;