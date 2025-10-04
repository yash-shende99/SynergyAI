'use client';

import { Wand2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import Placeholder from '../../../../../../../components/ui/Placeholder';

export default function NewTemplatePage() {
  const params = useParams();
  const projectId = params.projectId as string;

  return (
    <Placeholder
      Icon={Wand2}
      title="Custom Template Creator"
      subtitle={`A powerful, block-based editor will be built here for project ${projectId}, allowing you to design and save your own custom report templates for your team to use.`}
    />
  );
}