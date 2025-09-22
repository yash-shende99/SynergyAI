import Link from 'next/link';
import { Plus } from 'lucide-react';

const AddSimulationCard = () => (
    <Link href={`/dashboard/valuation/mc/new`} className="rounded-2xl border-2 border-dashed border-border bg-surface/20 flex flex-col items-center justify-center text-secondary hover:border-primary hover:text-primary transition-all duration-300 min-h-[180px]">
        <Plus size={32} />
        <span className="mt-2 font-semibold">New Simulation</span>
    </Link>
);
export default AddSimulationCard;