import { ChevronLeft, ChevronRight } from 'lucide-react';

const TemplatesFooter = () => (
    <div className="flex justify-between items-center text-sm">
        <div className="flex items-center gap-1">
            <button className="p-1 text-secondary hover:text-white"><ChevronLeft size={20}/></button>
            <span className="px-2 py-0.5 bg-surface rounded text-white">1</span>
            <button className="p-1 text-secondary hover:text-white"><ChevronRight size={20}/></button>
        </div>
        <label className="flex items-center gap-2 text-secondary">
            <input type="checkbox" className="h-4 w-4 rounded bg-surface border-border text-primary"/>
            Show only my custom templates
        </label>
    </div>
);
export default TemplatesFooter;