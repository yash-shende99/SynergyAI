'use client';

import Placeholder from '../../../../../components/ui/Placeholder';
import { Users } from 'lucide-react';

export default function TeamPage() {
  return (
    <Placeholder 
      Icon={Users} 
      title="Team & Permissions" 
      subtitle="This is where you will manage team member access and roles (Admin, Editor, Viewer) for this specific project." 
    />
  );
}

