'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function ProjectChatRedirectPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.projectId as string;

  useEffect(() => {
    if (projectId) {
      // Automatically redirect to a new chat session when a user clicks the main "Ask" tab
      router.replace(`/dashboard/project/${projectId}/chat/new`);
    }
  }, [projectId, router]);

  return <div>Loading...</div>; // Or a loader component
}