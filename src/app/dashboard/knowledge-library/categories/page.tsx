// app/dashboard/project/[projectId]/vdr/categories/page.tsx
'use client';
import { useParams } from 'next/navigation';
import CategoriesSection from '../../../../components/features/knowledge/categories/CategoriesSection';

export default function VDRCategoriesPage() {
  
  const projectId = 'knowledge';

  return (
    <CategoriesSection projectId={projectId} />
  );
}