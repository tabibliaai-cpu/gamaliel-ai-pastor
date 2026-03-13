'use client';
import { useState, useEffect, useRef } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { BookOpen, Send, Plus, Menu, LogOut, User, ChevronLeft, ChevronRight } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Conversation {
  id: string;
  title: string;
  created_at: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConvId, setCurrentConvId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [usageInfo, setUsageInfo] = useState<{ used: number; limit: number; tier: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchUsage();
    fetchConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) router.push('/auth');
  }

  async function fetchUsage() {
    const res = await fetch('/api/usage');
    if (res.ok) {
      const data = await res.json();
      setUsageInfo(data);
    }
  }

  async function fetchConversations() {
    const res = await fetch('/api/conversations');
    if (res.ok) {
      const data = await res.json();
      setConversations(data);
    }
  }

  async function loadConversation(convId: string) {
    setCurrentConvId(convId);
    const res = await fetch(`/api/conversations/${convId}`);
    if (res.ok) {
      const data = await res.json();
      setMessages(data.messages || []);
    }
  }

  async function startNewConversation() {
    setCurrentConvId(null);
    setMessages([]);
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentInput, conversationId: currentConvId }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'An error occurred');
        setMessages(prev => prev.slice(0, -1));
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
        if (!currentConvId) {
          setCurrentConvId(data.conversationId);
          fetchConversations();
        }
        fetchUsage();
      }
    } catch {
      alert('Network error');
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.push('/');
  }

  return (
    <div className="flex h-screen bg-[#0b0d0e] text-[#ececf1] overflow-hidden font-sans">
      {/* Sidebar */}
      <div className={`${
        sidebarOpen ? 'w-[260px]' : 'w-0'
      } bg-[#171717] transition-all duration-300 flex flex-col h-full border-r border-white/10 overflow-hidden relative z-50`}>
        <div className="flex-1 flex flex-col p-2 space-y-1">
          <button
            onClick={startNewConversation}
            className="flex items-center gap-3 px-3 py-3 w-full rounded-lg hover:bg-[#2f2f2f] transition-all border border-white/20 mb-2 group"
          >
            <Plus size={16} className="text-white" />
            <span className="text-sm font-medium">New Chat</span>
          </button>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="text-[10px] font-bold text-[#676767] uppercase px-3 py-2">History</div>
            {conversations.map(conv => (
              <button
                key={conv.id}
                onClick={() => loadConversation(conv.id)}
                className={`w-full text-left px-3 py-3 rounded-lg text-sm truncate transition-all ${
                  currentConvId === conv.id
                    ? 'bg-[#2f2f2f] text-white'
                    : 'text-[#ececf1] hover:bg-[#2f2f2f]'
                }`}
              >
                {conv.title}
              </button>
            ))}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-2 border-t border-white/10 space-y-1">
          {usageInfo && (
            <div className="px-3 py-3 rounded-lg bg-[#2f2f2f]/50 mb-2">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">{usageInfo.tier} Plan</span>
                <span className="text-[10px] text-[#676767]">{usageInfo.used} / {usageInfo.limit}</span>
              </div>
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500 transition-all duration-500"
                  style={{ width: `${(usageInfo.used / usageInfo.limit) * 100}%` }}
                />
              </div>
              {usageInfo.tier === 'free' && (
                <button 
                  onClick={() => router.push('/dashboard')}
                  className="w-full mt-3 text-[11px] font-semibold text-white bg-amber-600 hover:bg-amber-500 py-1.5 rounded-md"
                >
                  Upgrade
                </button>
              )}
            </div>
          )}
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-[#2f2f2f] text-sm text-[#ececf1] transition-all"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0b0d0e] relative h-full">
        {/* Top Header */}
        <div className="h-12 flex items-center px-4 border-b border-white/5 sticky top-0 z-40 bg-[#0b0d0e]/80 backdrop-blur-md">
           <button
             onClick={() => setSidebarOpen(!sidebarOpen)}
             className="p-1.5 hover:bg-[#2f2f2f] rounded-md mr-2 text-[#676767]"
           >
             <Menu size={18} />
           </button>
           <div className="flex items-center gap-2">
             <BookOpen size={16} className="text-amber-500" />
             <span className="text-sm font-semibold tracking-tight">Gamaliel AI Pastor</span>
           </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative scroll-smooth custom-scrollbar">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center px-4 max-w-3xl mx-auto py-12">
              <div className="w-16 h-16 rounded-2xl bg-amber-500 flex items-center justify-center mb-6 shadow-lg shadow-amber-500/20">
                <BookOpen size={32} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold mb-3 tracking-tight text-center">Peace be with you.</h1>
              <p className="text-[#9b9b9b] text-center mb-10 max-w-md leading-relaxed">
                I am Gamaliel, your AI Biblical companion. How may I serve your spiritual growth today?
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
                {[
                  'What does the Bible say about anxiety?',
                  'Explain the Sermon on the Mount',
                  'How can I grow in my faith?',
                  'What is the meaning of grace?',
                ].map(q => (
                  <button
                    key={q}
                    onClick={() => setInput(q)}
                    className="p-4 rounded-xl bg-[#171717] hover:bg-[#2f2f2f] border border-white/5 text-left text-sm transition-all hover:border-white/10 group active:scale-[0.98]"
                  >
                    <div className="font-medium mb-1 text-white group-hover:text-amber-400">{q}</div>
                    <div className="text-[12px] text-[#676767]">Click to ask</div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto w-full px-4 pt-10 pb-32 space-y-10">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-5 group animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                  msg.role === 'user' ? 'flex-row-reverse' : ''
                }`}>
                  <div className={`w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0 shadow-sm ${
                    msg.role === 'assistant' 
                      ? 'bg-amber-500 text-white' 
                      : 'bg-[#2f2f2f] text-white border border-white/10'
                  }`}>
                    {msg.role === 'assistant' ? <BookOpen size={18} /> : <User size={18} />}
                  </div>
                  
                  <div className={`flex flex-col gap-1 max-w-[85%] ${msg.role === 'user' ? 'items-end' : ''}`}>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-[#676767] px-1 mb-1">
                      {msg.role === 'assistant' ? 'Gamaliel' : 'You'}
                    </div>
                    <div className={`rounded-2xl px-5 py-4 text-[15px] leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-[#2f2f2f] text-white rounded-tr-none'
                        : 'bg-transparent text-[#ececf1] rounded-tl-none'
                    }`}>
                      {msg.role === 'assistant' ? (
                        <div className="prose prose-invert max-w-none prose-p:my-3 prose-headings:my-4 prose-blockquote:border-amber-500 prose-blockquote:bg-amber-500/5 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-a:text-amber-400 prose-strong:text-white">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex gap-5 animate-pulse">
                  <div className="w-9 h-9 rounded-md bg-amber-500/50 flex items-center justify-center flex-shrink-0">
                    <BookOpen size={18} className="text-white/50" />
                  </div>
                  <div className="flex flex-col gap-2 w-full max-w-[85%]">
                    <div className="w-24 h-2 bg-white/5 rounded-full mb-1"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-white/5 rounded-lg w-full"></div>
                      <div className="h-4 bg-white/5 rounded-lg w-3/4"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#0b0d0e] via-[#0b0d0e] to-transparent pt-10 pb-6">
          <div className="max-w-3xl mx-auto px-4">
            <form onSubmit={sendMessage} className="relative group">
              <div className="relative flex items-end w-full bg-[#171717] border border-white/10 rounded-[26px] overflow-hidden focus-within:border-white/20 transition-all shadow-2xl">
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage(e as any);
                    }
                  }}
                  placeholder="Ask Gamaliel a question..."
                  rows={1}
                  className="flex-1 bg-transparent text-white px-5 py-4 focus:outline-none resize-none max-h-52 text-[15px] custom-scrollbar"
                  disabled={loading}
                />
                <div className="p-2 pr-3">
                  <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="p-2.5 rounded-2xl bg-white text-[#0b0d0e] hover:bg-[#ececf1] disabled:bg-[#2f2f2f] disabled:text-[#676767] transition-all active:scale-95 shadow-lg shadow-white/5"
                  >
                    <Send size={18} fill="currentColor" />
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-center text-[#676767] mt-3">
                Gamaliel AI Pastor provides Biblical guidance but is not a substitute for pastoral care or Scripture study.
              </p>
            </form>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
