import { FC } from 'react';
import ReactMarkdown from 'react-markdown';
import { Bot } from 'lucide-react';

const AiRationalePanel: FC<{ rationale: string }> = ({ rationale }) => (
    <div className="p-6 rounded-xl border border-border bg-surface/50 h-full">
        <div className="flex items-center gap-3 mb-4">
            <Bot className="h-6 w-6 text-primary"/>
            <h3 className="text-lg font-bold text-white">AI-Generated Strategic Rationale</h3>
        </div>
        <div className="prose prose-sm prose-invert max-w-none prose-strong:text-white prose-p:leading-relaxed">
            <ReactMarkdown>{rationale}</ReactMarkdown>
        </div>
    </div>
);
export default AiRationalePanel;