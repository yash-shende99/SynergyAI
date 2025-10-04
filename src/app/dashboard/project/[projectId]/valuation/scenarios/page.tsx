'use client';

import ScenarioGallerySection from '../../../../../../components/features/valuation/scenarios/gallery/ScenarioGallerySection';
import { useParams } from 'next/navigation';

export default function ScenariosGalleryPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  
  return (
    <ScenarioGallerySection projectId={projectId} />
  );
}