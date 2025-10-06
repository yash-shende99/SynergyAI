// hooks/useEnhancedCache.ts - IMPROVED FRONTEND CACHE
import { useState, useEffect, useRef, useCallback } from 'react';

// Global cache store
const globalCache = new Map<string, { data: any; timestamp: number; ttl: number }>();

export function useEnhancedCache<T>(
  key: string, 
  fetchFunction: () => Promise<T>,
  options: {
    ttl?: number; // Time to live in milliseconds
    enabled?: boolean;
    onError?: (error: Error) => void;
  } = {}
) {
  const { ttl = 120000, enabled = true, onError } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const loadData = useCallback(async (forceRefresh = false) => {
    if (!enabled) return;

    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = globalCache.get(key);
      if (cached && Date.now() - cached.timestamp < cached.ttl) {
        setData(cached.data);
        setLoading(false);
        setError(null);
        console.log('🔄 Using cached data for:', key);
        return;
      }
    }

    setLoading(true);
    setError(null);
    
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();

    try {
      const result = await fetchFunction();
      setData(result);
      
      // Cache the result
      globalCache.set(key, { 
        data: result, 
        timestamp: Date.now(), 
        ttl 
      });
      
      console.log('💾 Cached data for:', key);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Request aborted for:', key);
        return;
      }
      
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch data';
      setError(errorMsg);
      onError?.(err);
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, [key, fetchFunction, ttl, enabled, onError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refetch = useCallback(async () => {
    console.log('🔄 Manually refetching:', key);
    await loadData(true);
  }, [loadData, key]);

  const invalidate = useCallback(() => {
    console.log('🗑️ Invalidating cache for:', key);
    globalCache.delete(key);
    setData(null);
    setLoading(true);
  }, [key]);

  return { 
    data, 
    loading, 
    error, 
    refetch, 
    invalidate,
    // Helper to invalidate multiple keys by pattern
    invalidatePattern: (pattern: string) => {
      Array.from(globalCache.keys())
        .filter(k => k.includes(pattern))
        .forEach(k => globalCache.delete(k));
    }
  };
}

// Utility function to clear all cache
export const clearAllCache = () => {
  globalCache.clear();
  console.log('🧹 All cache cleared');
};