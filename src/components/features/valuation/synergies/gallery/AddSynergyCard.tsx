import Link from 'next/link';
import { Plus } from 'lucide-react';

const AddSynergyCard = () => (
    <Link href="/dashboard/valuation/synergies/new" className="rounded-2xl border-2 border-dashed border-border bg-surface/20 flex flex-col items-center justify-center text-secondary hover:border-primary hover:text-primary transition-all duration-300 min-h-[190px]">
        <Plus size={32} />
        <span className="mt-2 font-semibold">Model New Synergy</span>
    </Link>
);
export default AddSynergyCard;