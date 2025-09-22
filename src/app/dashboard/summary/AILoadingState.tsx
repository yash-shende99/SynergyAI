'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

// --- THIS IS THE FIX #1: A longer, more engaging, and non-repetitive list of loading texts ---
const loadingTexts = [
  'Aggregating deal data from your PostgreSQL database...',
  'Running semantic search on VDR document library...',
  'Identifying key risks and strategic opportunities from filings...',
  'Cross-referencing market intelligence data...',
  'Briefing the fine-tuned SynergyAI Specialist model...',
  'Generating a high-level executive summary...',
  'Analyzing sector concentration and pipeline health...',
  'Calculating exposure and benchmarking against portfolio targets...',
  'Synthesizing qualitative insights with quantitative metrics...',
  'Formatting the final narrative with key insights...',
  'Almost there, compiling the final report...'
];

const AILoadingState = () => {
  const [currentText, setCurrentText] = useState(loadingTexts[0]);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      // --- THIS IS THE FIX #2: The Linear Progress Logic ---
      // We now check if we have reached the end of the list.
      if (index < loadingTexts.length - 1) {
        index = index + 1;
        setCurrentText(loadingTexts[index]);
      } else {
        // If we are at the last message, we stop the interval.
        // This leaves the final message displayed on the screen.
        clearInterval(interval);
      }
    }, 2500); // Change text every 2.5 seconds
    
    // This is a cleanup function that runs when the component is unmounted.
    // It's a best practice to prevent memory leaks.
    return () => clearInterval(interval);
  }, []); // The empty array [] ensures this effect runs only once.

  return (
    <div className="flex flex-col items-center justify-center h-full text-center text-secondary pt-16">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4"/>
      <p className="text-sm font-semibold text-slate-300 transition-opacity duration-500">{currentText}</p>
    </div>
  );
};

export default AILoadingState;
