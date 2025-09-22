import { FC, useState, useCallback, useEffect } from 'react';
import { Company } from '../../../types';
import { Search, Loader2 } from 'lucide-react';


const CompanySearchStep: FC<{ onCompanySelect: (c: Company) => void }> = ({ onCompanySelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchResults = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) { setResults([]); return; }
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/companies/search_by_text?query=${searchQuery}`);
      const data = await response.json();
      const adaptedData = data.map((item: any) => ({
        id: item.cin, name: item.name, logoUrl: item.logo_url,
        sector: item.industry?.sector || 'N/A', location: item.location?.headquarters || 'N/A',
        revenue: item.financial_summary?.revenue_cr || 0, employees: item.financial_summary?.employee_count || 0,
      }));
      setResults(adaptedData);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => { fetchResults(query); }, 300);
    return () => clearTimeout(handler);
  }, [query, fetchResults]);

  return (
    <div>
      <h4 className="font-semibold text-white mb-2">Step 1: Select Target Company</h4>
      <div className="relative"><Search size={16} className="..."/> <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by company name, CIN, sector..." className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-lg text-white ..." /></div>
      <div className="mt-4 max-h-60 overflow-y-auto">
        {isLoading && <Loader2 className="animate-spin mx-auto"/>}
        {results.map(company => (
            <button key={company.id} onClick={() => onCompanySelect(company)} className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-surface">
                <img src={company.logoUrl} className="h-8 w-8 rounded-md bg-white p-1"/>
                <div><p className="font-medium text-white text-sm">{company.name}</p><p className="text-xs text-secondary">{company.sector}</p></div>
            </button>
        ))}
      </div>
    </div>
  );
};
export default CompanySearchStep;