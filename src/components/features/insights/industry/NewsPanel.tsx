import { FC } from 'react';
import { IndustryUpdate } from '../../../../types';
import { Newspaper, ExternalLink } from 'lucide-react';

const NewsPanel: FC<{ title: string; items: IndustryUpdate[] }> = ({ title, items }) => (
    <div className="p-4 rounded-xl border border-border bg-surface/50 h-full">
        <div className="flex items-center gap-3 mb-2 p-2">
            <Newspaper className="h-5 w-5 text-secondary"/>
            <h3 className="font-semibold text-white">{title}</h3>
        </div>
        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {items.length > 0 ? items.map(item => (
                <a href={item.url || '#'} target="_blank" rel="noopener noreferrer" key={item.id} className="block p-3 rounded-lg bg-background/50 hover:bg-surface/80">
                    <p className="text-sm font-medium text-white line-clamp-2">{item.title}</p>
                    <div className="flex justify-between items-center mt-2 text-xs text-secondary">
                        <span>{new URL(item.source).hostname}</span>
                        <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                    </div>
                </a>
            )) : <p className="text-sm text-secondary text-center py-8">No relevant news found.</p>}
        </div>
    </div>
);

export default NewsPanel;
