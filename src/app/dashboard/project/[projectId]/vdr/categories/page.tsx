// app/dashboard/project/[projectId]/vdr/categories/page.tsx
'use client';
import { useParams } from 'next/navigation';
import CategoriesSection from '../../../../../../components/features/vdr/categories/CategoriesSection';

export default function VDRCategoriesPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  return (
    <CategoriesSection projectId={projectId} />
  );
}