'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { MessageSquare, Send, Paperclip, Users, Hash, Shield, Clock } from 'lucide-react';
import { supabase } from '../../../../../lib/supabaseClient';

interface ChatMessage {
  id: string;
  senderName: string;
  senderRole: string;
  avatarUrl?: string;
  content: string;
  timestamp: string;
  isCurrentUser: boolean;
}

export default function ProjectTeamChatPage() {
  const params = useParams();
  const projectId = params?.projectId as string;
  const [activeChannel, setActiveChannel] = useState('deal-diligence');
  const [inputMessage, setInputMessage] = useState('');
  const [currentUserName, setCurrentUserName] = useState('You');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const channels = [
    { id: 'deal-diligence', name: 'deal-diligence', desc: 'Core findings, documents & timeline' },
    { id: 'valuation-qa', name: 'valuation-qa', desc: 'DCF models, assumptions & synergies' },
    { id: 'legal-and-risks', name: 'legal-and-risks', desc: 'Regulatory, MCA & compliance reviews' },
    { id: 'general', name: 'general', desc: 'General team announcements & coordination' }
  ];

  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({
    'deal-diligence': [
      {
        id: '1',
        senderName: 'Sarah Jenkins',
        senderRole: 'Lead M&A Advisor',
        content: 'I have reviewed the preliminary VDR disclosures. The operational margins look solid, but we should verify historical EBITDA adjustments.',
        timestamp: '10:14 AM',
        isCurrentUser: false
      },
      {
        id: '2',
        senderName: 'Rajesh Sharma',
        senderRole: 'Senior Financial Analyst',
        content: 'Agreed Sarah. Working on the sensitivity table now. The synergy score module is cross-referencing our annual report filings.',
        timestamp: '10:18 AM',
        isCurrentUser: false
      }
    ],
    'valuation-qa': [
      {
        id: '3',
        senderName: 'Rajesh Sharma',
        senderRole: 'Senior Financial Analyst',
        content: 'Base case DCF yields an equity valuation range of ₹12,400 - ₹14,200 Cr at a 12.5% WACC.',
        timestamp: '09:45 AM',
        isCurrentUser: false
      }
    ],
    'legal-and-risks': [
      {
        id: '4',
        senderName: 'Meera Patel',
        senderRole: 'Legal Counsel',
        content: 'Checked the change-of-control clauses in key supplier contracts. No material break fees or exclusivity lock-ins detected so far.',
        timestamp: 'Yesterday',
        isCurrentUser: false
      }
    ],
    'general': [
      {
        id: '5',
        senderName: 'Sarah Jenkins',
        senderRole: 'Lead M&A Advisor',
        content: 'Welcome everyone to the project workspace. Please ensure all newly received target data room documents are placed in the VDR.',
        timestamp: '2 days ago',
        isCurrentUser: false
      }
    ]
  });

  useEffect(() => {
    async function loadUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.user_metadata?.full_name) {
        setCurrentUserName(session.user.user_metadata.full_name);
      } else if (session?.user?.email) {
        setCurrentUserName(session.user.email.split('@')[0]);
      }
    }
    loadUser();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChannel]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      senderName: currentUserName,
      senderRole: 'Project Member',
      content: inputMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isCurrentUser: true
    };

    setMessages(prev => ({
      ...prev,
      [activeChannel]: [...(prev[activeChannel] || []), newMsg]
    }));

    setInputMessage('');
  };

  const channelMessages = messages[activeChannel] || [];

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-secondarySurface/30 border border-border/80 rounded-2xl overflow-hidden backdrop-blur-md">
      {/* Top Channel Bar */}
      <div className="px-6 py-3.5 border-b border-border/80 flex items-center justify-between bg-surface/50">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/20 text-primary">
            <Hash className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              #{activeChannel}
              <span className="text-xs px-2 py-0.5 rounded-full bg-surface text-secondary font-normal border border-border/50">
                Project Team
              </span>
            </h2>
            <p className="text-xs text-secondary">
              {channels.find(c => c.id === activeChannel)?.desc}
            </p>
          </div>
        </div>

        {/* Channel Selector Pills */}
        <div className="flex items-center gap-1.5 bg-background/50 p-1 rounded-xl border border-border/50">
          {channels.map(ch => (
            <button
              key={ch.id}
              onClick={() => setActiveChannel(ch.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeChannel === ch.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-secondary hover:text-white hover:bg-surface/50'
              }`}
            >
              #{ch.name}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {channelMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-secondary">
            <MessageSquare className="h-10 w-10 mb-2 opacity-30" />
            <p className="text-sm">No messages in #{activeChannel} yet.</p>
            <p className="text-xs mt-1 text-slate-500">Be the first to share an update with the deal team.</p>
          </div>
        ) : (
          channelMessages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-2xl ${msg.isCurrentUser ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${
                msg.isCurrentUser ? 'bg-primary' : 'bg-surface border border-border'
              }`}>
                {msg.senderName.charAt(0).toUpperCase()}
              </div>

              <div className={`space-y-1 ${msg.isCurrentUser ? 'items-end' : ''}`}>
                <div className={`flex items-center gap-2 text-xs ${msg.isCurrentUser ? 'justify-end' : ''}`}>
                  <span className="font-semibold text-white">{msg.senderName}</span>
                  <span className="text-slate-400 text-[10px]">({msg.senderRole})</span>
                  <span className="text-secondary text-[10px] flex items-center gap-1">
                    <Clock size={10} />
                    {msg.timestamp}
                  </span>
                </div>

                <div className={`p-3.5 rounded-2xl text-sm leading-relaxed ${
                  msg.isCurrentUser
                    ? 'bg-primary text-white rounded-tr-none'
                    : 'bg-surface border border-border/60 text-slate-200 rounded-tl-none'
                }`}>
                  {msg.content}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-4 bg-surface/50 border-t border-border/80">
        <form onSubmit={handleSendMessage} className="flex items-center gap-3">
          <button
            type="button"
            className="p-2.5 text-secondary hover:text-white rounded-xl hover:bg-surface transition-colors"
            title="Attach File"
          >
            <Paperclip size={18} />
          </button>

          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={`Message #${activeChannel}...`}
            className="flex-1 bg-background/80 border border-border/70 rounded-xl px-4 py-2.5 text-sm text-white placeholder-secondary focus:outline-none focus:border-primary/80 transition-colors"
          />

          <button
            type="submit"
            disabled={!inputMessage.trim()}
            className="px-4 py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white rounded-xl text-sm font-medium flex items-center gap-2 transition-all shadow-sm"
          >
            <span>Send</span>
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
}
