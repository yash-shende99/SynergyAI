'use client';

import { FC, useState } from 'react';
// --- THIS IS THE FIX: We import the necessary types from React ---
import React from 'react';
import { ProjectAiChat, ChatMessage } from '../../../types';
import ProjectChatPanel from './ProjectChatPanel';

interface ProjectChatSectionProps {
  projectId: string;
  initialConversation: ProjectAiChat | null;
}

const ProjectChatSection: FC<ProjectChatSectionProps> = ({ projectId, initialConversation }) => {
  // The state is now managed within this component
  const [conversation, setConversation] = useState<ProjectAiChat | null>(initialConversation);

  return (
    <div className="h-[80vh]">
        <ProjectChatPanel 
          projectId={projectId}
          conversation={conversation}
          // We pass down the correctly typed state setter function
          setConversation={setConversation}
        />
    </div>
  );
};

export default ProjectChatSection;