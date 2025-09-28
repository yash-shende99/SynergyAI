'use client';

import { useState, useEffect } from 'react';
import { NewsItem, NewsResponse } from '../../../types';
import { Loader2, RefreshCw, AlertTriangle } from 'lucide-react';
import NewsDashboard from '../../../components/features/intelligence/NewsDashboard';
import { supabase } from '../../../lib/supabaseClient'; // Add this import

export default function IntelligencePage() {
  const [newsData, setNewsData] = useState<NewsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchNews = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Get the current session with access token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }
      
      const response = await fetch('http://localhost:8000/api/news/live', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch news: ${response.status}`);
      }
      
      const data: NewsResponse = await response.json();
      setNewsData(data);
      setLastUpdated(new Date());
      
    } catch (err: any) {
      setError(err.message);
      console.error('News fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
    
    // Auto-refresh every 10 minutes
    const interval = setInterval(fetchNews, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-lg">Loading news...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-64 text-red-500">
        <AlertTriangle className="h-12 w-12 mb-4" />
        <p className="text-lg font-semibold mb-2">Failed to load news</p>
        <p className="text-sm text-gray-400 mb-4">{error}</p>
        <button 
          onClick={fetchNews}
          className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">News Dashboard</h1>
          <p className="text-gray-400">Real-time market news and project updates</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-400">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
          <button 
            onClick={fetchNews}
            className="flex items-center px-3 py-2 bg-gray-700 rounded hover:bg-gray-600 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {newsData && (
        <NewsDashboard 
          projectNews={newsData.project_news} 
          marketNews={newsData.market_news} 
        />
      )}
    </div>
  );
}