'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { InvestmentMemo } from '../../../../../../types';
import { supabase } from '../../../../../../lib/supabaseClient';
import GenerationView from '../../../../../../components/features/reports/generate/GenerationView';
import MemoWorkspace from '../../../../../../components/features/reports/generate/MemoWorkspace';

export default function GenerateMemoPage() {
  const [memoData, setMemoData] = useState<InvestmentMemo | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const params = useParams();
  const projectId = params.projectId as string;

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError('');
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { 
        alert("Please log in"); 
        setIsGenerating(false);
        return; 
      }

      console.log('🔍 Generating memo for project:', projectId);
      console.log('🔍 Using access token:', session.access_token ? 'Present' : 'Missing');

      // Use absolute URL for API call
      const apiUrl = process.env.NODE_ENV === 'development' 
        ? `http://localhost:8000/api/projects/${projectId}/generate_memo`
        : `/api/projects/${projectId}/generate_memo`;

      console.log('🔍 Calling API:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('🔍 Response status:', response.status);
      console.log('🔍 Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error:', errorText);
        throw new Error(`Failed to generate memo: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ Memo generated successfully:', data);
      setMemoData(data);
    } catch (err: any) {
      console.error('❌ Generation error:', err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGoBack = () => {
    setMemoData(null);
    setError('');
  };

  if (memoData) {
    return <MemoWorkspace memo={memoData} onGoBack={handleGoBack} />;
  }

  return (
    <GenerationView 
      isGenerating={isGenerating} 
      onGenerate={handleGenerate}
      error={error}
    />
  );
}