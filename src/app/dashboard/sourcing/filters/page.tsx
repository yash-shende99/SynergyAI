'use client';

import { useState, useEffect, useCallback } from 'react';
import FilterSidebar from '../../../../components/features/sourcing/filters/FilterSidebar';
import ResultsPanel from '../../../../components/features/sourcing/filters/ResultsPanel';
import { Company } from '../../../../types';

// Define a type for our filter state

export interface Filters {
  revenueMin: number;
  employeeMax: number;
  sector: string;
  hqState: string;
  ebitdaMarginMin: number;
  roeMin: number;
}
export default function SourcingFiltersPage() {
  const [filters, setFilters] = useState<Filters>({
    revenueMin: 0,
    employeeMax: 1000000,
    sector: 'All',
    hqState: 'All',
    ebitdaMarginMin: 0,
    roeMin: 0,
  });
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // This function fetches data from our new backend API
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      // Build the query string dynamically based on the filters
      const params = new URLSearchParams();
      if (filters.revenueMin > 0) params.append('revenue_min', filters.revenueMin.toString());
      if (filters.employeeMax < 1000000) params.append('employee_max', filters.employeeMax.toString());
      if (filters.sector !== 'All') params.append('sector', filters.sector);
      if (filters.hqState !== 'All') params.append('hq_state', filters.hqState);
      if (filters.ebitdaMarginMin > 0) params.append('ebitda_margin_min', filters.ebitdaMarginMin.toString());
      if (filters.roeMin > 0) params.append('roe_min', filters.roeMin.toString());
      
      const response = await fetch(`http://localhost:8000/api/companies/filter?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch data from the server.');
      }
      
      const data = await response.json();

      // We need to adapt the data from the API to our frontend 'Company' type
      if (Array.isArray(data)) {
      const adaptedData = data.map((item: any) => ({
        id: item.cin,
        name: item.name,
        logoUrl: item.logo_url,
        sector: item.industry?.sector || 'N/A',
        location: item.location?.headquarters || 'N/A',
        revenue: item.financial_summary?.revenue_cr || 0,
        employees: item.financial_summary?.employee_count || 0,
      }));
      setCompanies(adaptedData);
    } else {
        // If the backend sends something that's not an array, we clear results and log an error.
        setCompanies([]);
        console.error("API did not return an array:", data);
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [filters]); // Re-run this function whenever filters change

  // This useEffect hook triggers the initial data fetch when the page loads
  // and subsequent fetches whenever the filters state is updated.
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 500); // Debounce to avoid firing API calls on every slider move
    
    return () => clearTimeout(timer); // Cleanup timer
  }, [fetchData]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
      {/* The filter sidebar now controls the live state */}
      <div className="lg:col-span-1">
        <FilterSidebar filters={filters} setFilters={setFilters} />
      </div>

      {/* The results panel now displays live data or loading/error states */}
      <div className="lg:col-span-3">
        <ResultsPanel 
          companies={companies}
          isLoading={isLoading}
          error={error}
        />
      </div>
    </div>
  );
}
