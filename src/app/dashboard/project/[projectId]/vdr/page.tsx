// app/dashboard/project/[projectId]/vdr/page.tsx
'use client';
import { useParams } from 'next/navigation';
import UploadSection from '../../../../../components/features/vdr/upload/UploadSection';

export default function ProjectVDRPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  return (
    <UploadSection projectId={projectId} />
  );
}