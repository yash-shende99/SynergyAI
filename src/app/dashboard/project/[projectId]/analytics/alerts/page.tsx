'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Alert, AlertPriority, AlertType } from '../../../../../../types';
import { Loader2 } from 'lucide-react';
import { supabase } from '../../../../../../lib/supabaseClient';
import AlertsSection from '../../../../../../components/features/analytics/alerts/AlertsSection';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<{ priorities: AlertPriority[], types: AlertType[] }>({ priorities: [], types: [] });
  const params = useParams();
  const projectId = params.projectId as string;

  const fetchAlerts = useCallback(async () => {
    if (!projectId) return;
    
    setIsLoading(true);
    setError(null);
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { 
      setError("No active session");
      setIsLoading(false); 
      return; 
    }

    try {
      const queryParams = new URLSearchParams();
      if (filters.priorities.length > 0) queryParams.append('priorities', filters.priorities.join(','));
      if (filters.types.length > 0) queryParams.append('types', filters.types.join(','));

      const response = await fetch(`http://localhost:8000/api/projects/${projectId}/alerts?${queryParams.toString()}`, {
        headers: { 
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      setAlerts(data);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch alerts');
    } finally {
      setIsLoading(false);
    }
  }, [projectId, filters]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>;
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-full space-y-4">
        <div className="text-red-400 text-lg">Error loading alerts</div>
        <div className="text-slate-400 text-sm max-w-md text-center">{error}</div>
        <button 
          onClick={fetchAlerts}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <AlertsSection
      alerts={alerts}
      filters={filters}
      setFilters={setFilters}
    />
  );
}