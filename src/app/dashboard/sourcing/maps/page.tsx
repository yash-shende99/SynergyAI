'use client';

import { useState, useEffect, useCallback } from 'react';
import MarketMapLayout from '../../../../components/features/sourcing/maps/MarketMapLayout';
import { CompanyMapProfile, MarketMapFilters } from '../../../../types';
import { Loader2, AlertTriangle } from 'lucide-react';

export default function SourcingMapsPage() {
  const [filters, setFilters] = useState<MarketMapFilters>({
    sector: 'All',
    hqState: 'All',
    revenueMin: 0,
    growthMin: 0,
    ebitdaMarginMin: 0,
    roeMin: 0,
  });
  const [companies, setCompanies] = useState<CompanyMapProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(''); // Reset error on new fetch
    try {
      const params = new URLSearchParams(filters as any);
      const response = await fetch(`http://localhost:8000/api/companies/market_map?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch market map data.');
      }
      
      const data = await response.json();

      // --- THIS IS THE DEFINITIVE FIX ---
      // We now robustly check if the data received from the API is an array.
      // This prevents the ".filter is not a function" crash.
      if (Array.isArray(data)) {
        setCompanies(data);
      } else {
        // If the backend sends something that's not an array, we treat it
        // as an error, clear the results, and log it for debugging.
        setCompanies([]);
        console.error("API did not return an array:", data);
        throw new Error("Received invalid data format from the server.");
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchData();
    }, 500);
    return () => clearTimeout(handler);
  }, [fetchData]);

  // --- NEW, ROBUST RENDERING LOGIC ---
  const renderContent = () => {
    if (isLoading) {
      return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>;
    }
    if (error) {
      return <div className="flex flex-col justify-center items-center h-full text-red-400"><AlertTriangle className="h-8 w-8 mb-2"/><p className="font-semibold">Error Loading Map</p><p className="text-sm text-secondary">{error}</p></div>;
    }
    return <MarketMapLayout companies={companies} filters={filters} setFilters={setFilters} />;
  };

  return (
    <div className="h-full">
      {renderContent()}
    </div>
  );
}