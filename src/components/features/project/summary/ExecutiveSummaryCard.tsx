import { FC } from 'react';
import { Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const ExecutiveSummaryCard: FC<{ summary: string }> = ({ summary }) => (
    <div className="p-6 rounded-xl border border-border bg-surface/50 h-full">
        <div className="flex items-center gap-3 mb-4">
            <Bot className="h-6 w-6 text-primary"/>
            <h3 className="text-lg font-bold text-white">AI Executive Summary</h3>
        </div>
        <div className="prose prose-sm prose-invert max-w-none prose-strong:text-white prose-p:leading-relaxed">
            <ReactMarkdown>{summary}</ReactMarkdown>
        </div>
    </div>
);

export default ExecutiveSummaryCard;
