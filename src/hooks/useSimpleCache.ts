// hooks/useSimpleCache.ts - FRONTEND CACHE
import { useState, useEffect, useRef } from 'react';

export function useSimpleCache<T>(
  key: string, 
  fetchFunction: () => Promise<T>,
  cacheTime = 120000 // 2 minutes
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cache = useRef<Map<string, { data: T; timestamp: number }>>(new Map());

  useEffect(() => {
    const loadData = async () => {
      // Check cache first
      const cached = cache.current.get(key);
      if (cached && Date.now() - cached.timestamp < cacheTime) {
        setData(cached.data);
        setLoading(false);
        console.log('🔄 Using cached data for:', key);
        return;
      }

      setLoading(true);
      try {
        const result = await fetchFunction();
        setData(result);
        // Cache the result
        cache.current.set(key, { data: result, timestamp: Date.now() });
        console.log('💾 Cached data for:', key);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [key]);

  const refetch = async () => {
    console.log('🔄 Manually refetching:', key);
    cache.current.delete(key); // Clear cache
    setLoading(true);
    try {
      const result = await fetchFunction();
      setData(result);
      cache.current.set(key, { data: result, timestamp: Date.now() });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
}