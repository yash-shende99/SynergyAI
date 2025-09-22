'use client';

import { useState, useEffect, FC } from 'react';
import ReactMarkdown from 'react-markdown';

interface TypewriterTextProps {
  text: string;
}

const TypewriterText: FC<TypewriterTextProps> = ({ text }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    setDisplayedText(''); // Reset on new text
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(prev => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 15); // Adjust speed of typing here (lower is faster)
    return () => clearInterval(interval);
  }, [text]);

  return (
    <div className="prose prose-sm prose-invert max-w-none prose-p:my-0 text-white">
      <ReactMarkdown>{displayedText}</ReactMarkdown>
    </div>
  );
};

export default TypewriterText;