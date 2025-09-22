'use client';

import { Wand2 } from 'lucide-react';
import Placeholder from '../../../../../components/ui/Placeholder';

export default function NewTemplatePage() {
  return (
    <Placeholder
      Icon={Wand2}
      title="Custom Template Creator"
      subtitle="A powerful, block-based editor will be built here, allowing you to design and save your own custom report templates for your team to use."
    />
  );
}