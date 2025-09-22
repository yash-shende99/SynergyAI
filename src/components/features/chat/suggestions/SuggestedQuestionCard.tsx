'use client';

import { FC } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';

interface SuggestedQuestionCardProps {
  question: string;
}

const SuggestedQuestionCard: FC<SuggestedQuestionCardProps> = ({ question }) => {
  const router = useRouter();

  const handleClick = () => {
    // Store the question in sessionStorage to pass to the Ask tab
    sessionStorage.setItem('suggestedQuestion', question);
    
    // Navigate to the Ask tab
    router.push('/dashboard/chat');
  };
  
  return (
    <button
      onClick={handleClick}
      className="p-4 rounded-lg border border-border bg-surface/50 text-left h-full transition-all duration-200 hover:border-primary/50 hover:bg-surface hover:-translate-y-1"
    >
      <Sparkles className="h-5 w-5 text-primary mb-2" />
      <p className="font-medium text-white text-sm">
        {question}
      </p>
    </button>
  );
};

export default SuggestedQuestionCard;