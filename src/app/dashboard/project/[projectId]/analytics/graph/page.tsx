'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { KnowledgeGraphData } from '../../../../../../types';
import { Loader2, AlertCircle, Network } from 'lucide-react';
import { supabase } from '../../../../../../lib/supabaseClient';
import KnowledgeGraphSection from '../../../../../../components/features/analytics/graph/KnowledgeGraphSection';

export default function KnowledgeGraphPage() {
  const [graphData, setGraphData] = useState<KnowledgeGraphData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const params = useParams();
  const projectId = params.projectId as string;

  useEffect(() => {
    if (!projectId) {
      setError('Project ID not found');
      setIsLoading(false);
      return;
    }


    async function fetchGraphData() {
      setIsLoading(true);
      setError('');

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('Not authenticated');
        }

        // Use the full backend URL with the correct port
        const response = await fetch(`http://localhost:8000/api/projects/${projectId}/knowledge_graph`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include' // Important for CORS with credentials
        });

        console.log('API Response status:', response.status);

        if (!response.ok) {
          // Try to get error message from response
          let errorMessage = `HTTP error! status: ${response.status}`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.detail || errorData.message || errorMessage;
          } catch (e) {
            // If response is not JSON, use status text
            errorMessage = response.statusText || errorMessage;
          }
          throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log('📊 Graph API Response:', {
          nodes: data.nodes,
          links: data.links,
          categories: data.categories
        });

        // Check if executives are included
        const executiveNodes = data.nodes.filter((node: any) => node.category === 'Executive');
        console.log('👨‍💼 Executive nodes found:', executiveNodes);

        // Check if relationships are included
        const relationshipNodes = data.nodes.filter((node: any) =>
          node.category === 'Competitor' || node.category === 'Subsidiary' || node.category === 'Partner'
        );
        console.log('🔗 Relationship nodes found:', relationshipNodes);

        // Validate graph data structure
        if (!data.nodes || !data.links) {
          throw new Error('Invalid graph data structure received');
        }

        console.log('Graph data loaded:', {
          nodes: data.nodes.length,
          links: data.links.length,
          categories: data.categories?.length || 0
        });

        setGraphData(data);
      } catch (err: any) {
        console.error('Error fetching knowledge graph:', err);
        setError(err.message || 'Failed to load knowledge graph');
        setGraphData(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchGraphData();
  }, [projectId]);


  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-secondary">Loading knowledge graph...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4 text-red-400">
        <AlertCircle className="h-8 w-8" />
        <p className="text-center max-w-md">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!graphData || graphData.nodes.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4 text-secondary">
        <Network className="h-8 w-8" />
        <p className="text-center max-w-md">
          No graph data available for this project.
          The target company may not have any recorded relationships yet.
        </p>
      </div>
    );
  }

  return <KnowledgeGraphSection graphData={graphData} />;
}