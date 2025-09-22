import { FC } from 'react';
import ReactMarkdown from 'react-markdown';

const AINarrative: FC<{ text: string }> = ({ text }) => (
    <div className="prose prose-sm prose-invert max-w-none 
                   prose-strong:text-white prose-strong:font-semibold
                   prose-ul:list-disc prose-ul:pl-5 prose-li:text-secondary">
      <ReactMarkdown>{text}</ReactMarkdown>
    </div>
);
export default AINarrative;