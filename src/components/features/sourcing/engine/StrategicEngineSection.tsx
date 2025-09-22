'use client';

import { useState } from 'react';
import NaturalLanguageInput from '../../../../components/features/sourcing/engine/NaturalLanguageInput';
import AIOutputPanel from '../../../../components/features/sourcing/engine/AIOutputPanel';
import { StrategicSearchResult } from '../../../../types';

export default function SourcingEnginePage() {
  const [results, setResults] = useState<StrategicSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState('');

  const handleGenerate = async (query: string) => {
    if (!query) return;
    setIsLoading(true);
    setStatusMessage('Finding relevant candidates from the database...');
    setError('');
    setResults([]);

    try {
      const response = await fetch('http://localhost:8000/api/companies/strategic_search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query })
      });

      if (!response.ok || !response.body) throw new Error('Network response was not ok.');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim() === '') continue;
          const streamObject = JSON.parse(line);

          // --- THIS IS THE FIX: The Smart Listener ---
          // It now understands the different message types from the backend.
          if (streamObject.type === 'status') {
            setStatusMessage(streamObject.message);
          } else if (streamObject.type === 'result') {
            const item = streamObject.data;
            const adaptedItem: StrategicSearchResult = {
              company: {
                id: item.company.cin, name: item.company.name, logoUrl: item.company.logo_url,
                sector: item.company.industry?.sector || 'N/A', location: item.company.location?.headquarters || 'N/A',
                revenue: item.company.financial_summary?.revenue_cr || 0, employees: item.company.financial_summary?.employee_count || 0,
              },
              fitScore: item.fitScore,
              rationale: item.rationale
            };
            setResults(prev => [...prev, adaptedItem].sort((a, b) => b.fitScore - a.fitScore));
          }
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
      setStatusMessage('');
    }
  };

  return (
    <div className="space-y-6">
      <NaturalLanguageInput onGenerate={handleGenerate} isLoading={isLoading} />
      <AIOutputPanel results={results} isLoading={isLoading} statusMessage={statusMessage} error={error} />
    </div>
  );
}

