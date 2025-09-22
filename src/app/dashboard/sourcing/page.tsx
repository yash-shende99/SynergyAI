'use client';

import { useState, useEffect, useCallback } from 'react';
import SearchBar from '../../../components/features/sourcing/SearchBar';
import CompanyResultCard from '../../../components/features/sourcing/CompanyResultCard';
import CompanyProfilePreview from '../../../components/features/sourcing/CompanyProfilePreview';
import { Company } from '../../../types';
import { Loader2, SearchX } from 'lucide-react';
import { Watchlist } from '../../../types';
import { supabase } from '../../../lib/supabaseClient';

export default function SourcingSearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);

  const fetchResults = useCallback(async (query: string) => {
    if (query.length < 2) {
      setResults([]);
      setSelectedCompany(null);
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/companies/search_by_text?query=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        const adaptedData = data.map((item: any) => ({
          id: item.cin, name: item.name, logoUrl: item.logo_url,
          sector: item.industry?.sector || 'N/A', location: item.location?.headquarters || 'N/A',
          revenue: item.financial_summary?.revenue_cr || 0, employees: item.financial_summary?.employee_count || 0,
        }));
        setResults(adaptedData);
        if (adaptedData.length > 0) setSelectedCompany(adaptedData[0]);
        else setSelectedCompany(null);
      } else {
        setResults([]);
        setSelectedCompany(null);
      }
    } catch (error) {
      console.error("Failed to fetch search results:", error);
      setResults([]);
      setSelectedCompany(null);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchResults(searchQuery);
    }, 300); // Debounce API calls
    return () => clearTimeout(handler);
  }, [searchQuery, fetchResults]);
  
  useEffect(() => {
    const fetchWatchlists = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      try {
        const response = await fetch('http://localhost:8000/api/watchlists', {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          setWatchlists(data);
        }
      } catch (error) {
        console.error('Error fetching watchlists:', error);
      }
    };
    
    fetchWatchlists();
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      <div className="lg:col-span-2 space-y-4">
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        {isLoading ? (
          <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>
        ) : (<>
            {searchQuery.length > 1 && results.length === 0 ? (
              <div className="flex flex-col justify-center items-center h-64 text-secondary">
                <SearchX size={48} className="mb-4"/>
                <p className="font-semibold">No Results Found</p>
                <p className="text-sm">Try a different search term.</p>
              </div>
            ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map(company => (
              <CompanyResultCard 
                key={company.id} 
                company={company}
                isSelected={selectedCompany?.id === company.id}
                onSelect={() => setSelectedCompany(company)}
              />
            ))}
          </div>
        )}
        </>)}
      </div>
      <div className="hidden lg:block">
        <CompanyProfilePreview company={selectedCompany} watchlists={watchlists}/>
      </div>
    </div>
  );
}