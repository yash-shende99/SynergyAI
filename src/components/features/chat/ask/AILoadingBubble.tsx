'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

// An expanded list of loading texts to make the process feel more substantial
const loadingTexts = [
  'Accessing document knowledge base...',
  'Running semantic search with RAG...',
  'Finding most relevant context chunks...',
  'Briefing fine-tuned M&A specialist...',
  'Synthesizing information...',
  'Generating final response...',
  'Formatting insights...',
  'Compiling final answer...'
];

const AILoadingBubble = () => {
  const [currentText, setCurrentText] = useState(loadingTexts[0]);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      // --- THIS IS THE DEFINITIVE FIX: The Linear Progress Logic ---
      // We now check if we have reached the end of the list.
      if (index < loadingTexts.length - 1) {
        index = index + 1;
        setCurrentText(loadingTexts[index]);
      } else {
        // If we are at the last message, we stop the interval.
        // This leaves the final message displayed on the screen until the
        // real AI response arrives and this component is unmounted.
        clearInterval(interval);
      }
    }, 2000); // Change text every 2 seconds
    
    // This is a cleanup function that runs when the component is unmounted.
    // It's a best practice to prevent memory leaks.
    return () => clearInterval(interval);
  }, []); // The empty array [] ensures this effect runs only once.

  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-2 text-primary p-3 rounded-lg bg-surface">
        <Loader2 className="animate-spin flex-shrink-0" size={20}/>
        <span className="text-sm text-secondary transition-opacity duration-500">{currentText}</span>
      </div>
    </div>
  );
};

export default AILoadingBubble;
