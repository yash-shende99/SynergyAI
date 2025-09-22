import { FC } from 'react';
import { Company } from '../../../../types';
import CompanyResultCard from '../CompanyResultCard';
import { Loader2, AlertTriangle } from 'lucide-react'; // For loading/error icons

// --- THIS IS THE FIX ---
// 1. Update the props interface to accept the new states.
interface ResultsPanelProps {
  companies: Company[];
  isLoading: boolean;
  error: string;
}

const ResultsPanel: FC<ResultsPanelProps> = ({ companies, isLoading, error }) => {
  return (
    <div className="p-4 rounded-xl border border-border bg-surface/50 h-full">
      <h3 className="font-bold text-white mb-4">
        {/* The title now changes based on the loading state */}
        {isLoading ? 'Fetching Results...' : `Showing ${companies.length} Results`}
      </h3>

      {/* 2. Add a dedicated UI for the loading state */}
      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      )}

      {/* 3. Add a dedicated UI for the error state */}
      {error && !isLoading && (
        <div className="flex flex-col items-center justify-center h-64 text-red-400">
          <AlertTriangle className="h-8 w-8 mb-2" />
          <p className="font-semibold">An Error Occurred</p>
          <p className="text-sm text-secondary">{error}</p>
        </div>
      )}

      {/* The main content is shown only when not loading and no error */}
      {!isLoading && !error && (
        <>
          {companies.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {companies.map(company => (
                <CompanyResultCard 
                  key={company.id}
                  company={company}
                  isSelected={false}
                  onSelect={() => {}}
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-secondary">No companies match the current filters.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ResultsPanel;