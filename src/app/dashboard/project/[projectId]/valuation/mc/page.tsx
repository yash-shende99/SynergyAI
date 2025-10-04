'use client';

import MonteCarloGallerySection from '../../../../../../components/features/valuation/mc/gallery/MonteCarloGallerySection';
import { useParams } from 'next/navigation';

export default function MonteCarloPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  
  return (
    <MonteCarloGallerySection projectId={projectId} />
  );
}