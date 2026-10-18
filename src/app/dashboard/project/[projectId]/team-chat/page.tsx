'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { MessageSquare, Send, Paperclip, Hash, Clock, Users, Loader2, CheckCircle2 } from 'lucide-react';
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

interface TeamMember {
  id: string;
  name: string;
  email: string;
  project_role?: string;
}

function formatTimestamp(isoStr: string): string {
  if (!isoStr) return 'Just now';
  try {
    const date = new Date(isoStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return 'Just now';
  }
}

export default function ProjectTeamChatPage() {
  const params = useParams();
  const projectId = params?.projectId as string;
  const [activeChannel, setActiveChannel] = useState('deal-diligence');
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState('You');
  const [currentUserRole, setCurrentUserRole] = useState('Team Member');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const channels = [
    { id: 'deal-diligence', name: 'deal-diligence', desc: 'Core diligence findings, VDR disclosures & timeline' },
    { id: 'valuation-qa', name: 'valuation-qa', desc: 'DCF models, sensitivity tables, multiple checks & assumptions' },
    { id: 'legal-and-risks', name: 'legal-and-risks', desc: 'Contracts, MCA compliance, warranties & liabilities' },
    { id: 'general', name: 'general', desc: 'Deal working group announcements & coordination' }
  ];

  // 1. Load authenticated user identity and project team
  useEffect(() => {
    async function loadIdentity() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setCurrentUserId(session.user.id);
          const name = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Team Member';
          setCurrentUserName(name);

          // Get project role
          if (projectId) {
            const teamRes = await fetch(`http://localhost:8000/api/projects/${projectId}/team?user_id=${session.user.id}`);
            if (teamRes.ok) {
              const members = await teamRes.json();
              if (Array.isArray(members)) {
                setTeamMembers(members);
                const me = members.find((m: any) => m.id === session.user.id);
                if (me?.project_role) setCurrentUserRole(me.project_role);
              }
            }
          }
        }
      } catch (err) {
        console.error('Error loading session:', err);
      }
    }
    loadIdentity();
  }, [projectId]);

  // 2. Fetch channel messages from PostgreSQL API
  const fetchMessages = useCallback(async (channel: string, showSpinner = false) => {
    if (!projectId) return;
    if (showSpinner) setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = {};
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const uid = session?.user?.id || currentUserId || '';
      const url = `http://localhost:8000/api/projects/${projectId}/team-chat/messages?channel=${channel}${uid ? `&user_id=${uid}` : ''}`;
      
      const response = await fetch(url, { headers });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          const formatted = data.map((item: any) => ({
            id: item.id,
            senderName: item.sender_name || 'Team Member',
            senderRole: item.sender_role || 'Member',
            content: item.content,
            timestamp: formatTimestamp(item.created_at),
            isCurrentUser: uid ? item.sender_id === uid : false
          }));
          setMessages(formatted);
        }
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      if (showSpinner) setLoading(false);
    }
  }, [projectId, currentUserId]);

  // 3. Initial channel load
  useEffect(() => {
    fetchMessages(activeChannel, true);
  }, [activeChannel, fetchMessages]);

  // 4. Supabase Realtime + Background Polling for instant sync
  useEffect(() => {
    if (!projectId) return;

    // Realtime PostgreSQL changes listener
    const channelSubscription = supabase
      .channel(`team-chat-realtime-${projectId}-${activeChannel}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'project_team_messages',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => {
          const newMsg = payload.new;
          if (newMsg && newMsg.channel === activeChannel) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === newMsg.id)) return prev;
              return [
                ...prev,
                {
                  id: newMsg.id,
                  senderName: newMsg.sender_name || 'Team Member',
                  senderRole: newMsg.sender_role || 'Member',
                  content: newMsg.content,
                  timestamp: formatTimestamp(newMsg.created_at),
                  isCurrentUser: currentUserId ? newMsg.sender_id === currentUserId : false
                }
              ];
            });
          }
        }
      )
      .subscribe();

    // Background polling sync every 5 seconds
    const interval = setInterval(() => {
      fetchMessages(activeChannel, false);
    }, 5000);

    return () => {
      supabase.removeChannel(channelSubscription);
      clearInterval(interval);
    };
  }, [projectId, activeChannel, currentUserId, fetchMessages]);

  // 5. Scroll to bottom on message updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // 6. Handle sending message to backend
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputMessage.trim();
    if (!text || isSending) return;

    setIsSending(true);
    setInputMessage('');

    // Optimistic UI update
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: ChatMessage = {
      id: tempId,
      senderName: currentUserName,
      senderRole: currentUserRole,
      content: text,
      timestamp: 'Just now',
      isCurrentUser: true
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const uid = session?.user?.id || currentUserId || '';
      const url = `http://localhost:8000/api/projects/${projectId}/team-chat/messages${uid ? `?user_id=${uid}` : ''}`;

      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          content: text,
          channel: activeChannel
        })
      });

      if (res.ok) {
        const persisted = await res.json();
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempId
              ? {
                  ...m,
                  id: persisted.id,
                  timestamp: formatTimestamp(persisted.created_at)
                }
              : m
          )
        );
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  };

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
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-normal border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Channel
              </span>
            </h2>
            <p className="text-xs text-secondary">
              {channels.find((c) => c.id === activeChannel)?.desc}
            </p>
          </div>
        </div>

        {/* Channel Selector Pills */}
        <div className="flex items-center gap-1.5 bg-background/50 p-1 rounded-xl border border-border/50">
          {channels.map((ch) => (
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

      {/* Main Chat Body: Messages + Right Info Rail */}
      <div className="flex-1 flex overflow-hidden">
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-secondary">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <p className="text-sm">Connecting to secure deal communication channel...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-secondary">
              <MessageSquare className="h-10 w-10 mb-2 opacity-30" />
              <p className="text-sm text-white font-medium">No messages in #{activeChannel} yet.</p>
              <p className="text-xs mt-1 text-slate-400">Post a message below to start collaborating with the deal team.</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-2xl ${msg.isCurrentUser ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${
                    msg.isCurrentUser ? 'bg-primary' : 'bg-surface border border-border'
                  }`}
                >
                  {msg.senderName.charAt(0).toUpperCase()}
                </div>

                <div className={`space-y-1 ${msg.isCurrentUser ? 'items-end' : ''}`}>
                  <div className={`flex items-center gap-2 text-xs ${msg.isCurrentUser ? 'justify-end' : ''}`}>
                    <span className="font-semibold text-white">{msg.senderName}</span>
                    <span className="text-slate-400 text-[10px] px-1.5 py-0.5 rounded bg-surface/80 border border-border/40">
                      {msg.senderRole}
                    </span>
                    <span className="text-secondary text-[10px] flex items-center gap-1">
                      <Clock size={10} />
                      {msg.timestamp}
                    </span>
                  </div>

                  <div
                    className={`p-3.5 rounded-2xl text-sm leading-relaxed ${
                      msg.isCurrentUser
                        ? 'bg-primary text-white rounded-tr-none'
                        : 'bg-surface border border-border/60 text-slate-200 rounded-tl-none'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Right Info Rail: Active Deal Team */}
        <div className="hidden lg:flex w-64 border-l border-border/60 bg-surface/20 flex-col p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
            <Users size={14} className="text-primary" />
            <span>Deal Team ({teamMembers.length || 2})</span>
          </div>

          <div className="space-y-2 overflow-y-auto flex-1">
            {teamMembers.length > 0 ? (
              teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-surface/40 transition-colors"
                >
                  <div className="relative">
                    <div className="h-7 w-7 rounded-full bg-surface border border-border flex items-center justify-center text-xs font-semibold text-white">
                      {member.name ? member.name.charAt(0).toUpperCase() : 'M'}
                    </div>
                    <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 border border-surface" />
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-medium text-white truncate">{member.name || member.email}</p>
                    <p className="text-[10px] text-secondary capitalize">{member.project_role || 'Member'}</p>
                  </div>
                </div>
              ))
            ) : (
              <>
                <div className="flex items-center gap-2.5 p-2 rounded-xl">
                  <div className="relative">
                    <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center text-xs font-semibold text-white">
                      {currentUserName.charAt(0).toUpperCase()}
                    </div>
                    <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 border border-surface" />
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-medium text-white truncate">{currentUserName} (You)</p>
                    <p className="text-[10px] text-secondary">{currentUserRole}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 p-2 rounded-xl opacity-75">
                  <div className="relative">
                    <div className="h-7 w-7 rounded-full bg-surface border border-border flex items-center justify-center text-xs font-semibold text-white">
                      A
                    </div>
                    <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 border border-surface" />
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-medium text-white truncate">Arjun Mehta</p>
                    <p className="text-[10px] text-secondary">Deal Lead</p>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="pt-3 border-t border-border/40 text-[11px] text-secondary flex items-center gap-1.5">
            <CheckCircle2 size={13} className="text-emerald-400" />
            <span>End-to-End Encrypted</span>
          </div>
        </div>
      </div>

      {/* Input Bar */}
      <div className="p-4 bg-surface/50 border-t border-border/80">
        <form onSubmit={handleSendMessage} className="flex items-center gap-3">
          <button
            type="button"
            className="p-2.5 text-secondary hover:text-white rounded-xl hover:bg-surface transition-colors"
            title="Attach File / Document"
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
            disabled={!inputMessage.trim() || isSending}
            className="px-4 py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white rounded-xl text-sm font-medium flex items-center gap-2 transition-all shadow-sm"
          >
            <span>Send</span>
            {isSending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
          </button>
        </form>
      </div>
    </div>
  );
}
