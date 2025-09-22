'use client';

import { FC, useState } from 'react'; // <-- Import useState
import { Bot, Download, Loader2 } from 'lucide-react'; // <-- Import Loader2
import {Button} from '../../../components/ui/button';
import AILoadingState from './AILoadingState';
import AINarrative from './AINarrative';

interface PanelProps {
  narrative: string | null;
  isLoading: boolean;
}

const NaturalLanguageSummaryPanel: FC<PanelProps> = ({ narrative, isLoading }) => {
  // --- THIS IS THE FIX ---
  const [isExporting, setIsExporting] = useState(false);

  // This is the new, professional export function.
  const handleExport = async () => {
    if (!narrative) return;
    setIsExporting(true);
    try {
      // It now makes a POST request to our backend "PDF Factory".
      const response = await fetch('http://localhost:8000/api/export/summary_pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // We send the narrative text to the backend.
        body: JSON.stringify({ 
            narrative: narrative,
            project_name: "All Active Deals" // Add context
        }),
      });

      if (!response.ok) {
        throw new Error('PDF generation failed on the server.');
      }

      // The backend sends back a real PDF file.
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'SynergyAI_Pipeline_Summary.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove(); // Clean up the link element
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };
  // --- END OF FIX ---

  return (
    <div className="p-6 bg-surface/80 border border-border rounded-xl backdrop-blur-sm h-full min-h-[300px]">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <Bot className="text-primary h-6 w-6" />
          <h3 className="text-lg font-bold text-white">AI Pipeline Summary</h3>
        </div>
        {/* The button is now connected to our new handleExport function and shows a loading state. */}
        <Button onClick={handleExport} variant="secondary" size="sm" disabled={isLoading || isExporting}>
          {isExporting ? (
            <Loader2 size={16} className="mr-2 animate-spin" />
          ) : (
            <Download size={16} className="mr-2" />
          )}
          {isExporting ? 'Generating...' : 'Export'}
        </Button>
      </div>
      <div>
        {isLoading ? <AILoadingState /> : <AINarrative text={narrative || ''} />}
      </div>
    </div>
  );
};

export default NaturalLanguageSummaryPanel;

