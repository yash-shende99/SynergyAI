'use client';

import Placeholder from '../../../components/ui/Placeholder';
import { Lightbulb } from 'lucide-react';

export default function RecommendationsPage() {
  return (
    <Placeholder 
      Icon={Lightbulb} 
      title="AI Recommendations" 
      subtitle="This is where the AI will proactively suggest acquisition targets based on market triggers and your strategic profile." 
    />
  );
}

