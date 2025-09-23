'use client';

import { useParams } from 'next/navigation';
import SynergyCreator from '../../../../../../../components/features/valuation/synergies/creator/SynergyCreator';

// This page renders the workspace for creating or editing a synergy model.
export default function SynergyWorkspacePage() {
  const params = useParams();
  const synergyId = params.synergyId as string;

  return (
    <SynergyCreator synergyId={synergyId} />
  );
}