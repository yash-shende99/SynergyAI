import Link from 'next/link';
import { Plus } from 'lucide-react';

const AddScenarioCard = () => {
    return (
        <Link href={`/dashboard/valuation/scenarios/new`} className="rounded-2xl border-2 border-dashed border-border bg-surface/20 flex flex-col items-center justify-center text-secondary hover:border-primary hover:text-primary transition-all duration-300">
            <Plus size={32} />
            <span className="mt-2 font-semibold">Add New Scenario</span>
        </Link>
    );
};
export default AddScenarioCard;