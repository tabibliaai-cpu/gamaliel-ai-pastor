'use client';
import { useState, useEffect, useRef } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { BookOpen, Send, Plus, Menu, LogOut, User } from 'lucide-react';

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
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, conversationId: currentConvId }),
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
    <div className="flex h-screen bg-[#0f172a] text-white">
      {/* Sidebar */}
      <div className={`${
        sidebarOpen ? 'w-64' : 'w-0'
      } bg-[#1e293b] transition-all duration-300 flex flex-col border-r border-gray-700 overflow-hidden`}>
        <div className="p-4 border-b border-gray-700">
          <button
            onClick={startNewConversation}
            className="w-full flex items-center gap-2 px-4 py-3 rounded-lg bg-[#334155] hover:bg-[#475569] transition-colors"
          >
            <Plus size={18} />
            <span>New Chat</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {conversations.map(conv => (
            <button
              key={conv.id}
              onClick={() => loadConversation(conv.id)}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm truncate transition-colors ${
                currentConvId === conv.id
                  ? 'bg-[#334155]'
                  : 'hover:bg-[#334155]'
              }`}
            >
              {conv.title}
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-gray-700 space-y-2">
          {usageInfo && (
            <div className="text-xs text-gray-400">
              <div className="flex justify-between mb-1">
                <span>{usageInfo.tier}</span>
                <span>{usageInfo.used}/{usageInfo.limit}</span>
              </div>
              <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500"
                  style={{ width: `${(usageInfo.used / usageInfo.limit) * 100}%` }}
                />
              </div>
              {usageInfo.tier === 'free' && (
                <button
                  onClick={() => router.push('/dashboard')}
                  className="mt-2 text-amber-400 text-xs hover:underline"
                >
                  Upgrade to Pro
                </button>
              )}
            </div>
          )}
          <button
            onClick={signOut}
            className="w-full flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-[#334155] text-sm"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-14 border-b border-gray-700 flex items-center px-4 gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-[#334155] rounded-lg"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <BookOpen size={20} className="text-amber-400" />
            <span className="font-semibold">Gamaliel AI Pastor</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center px-4 text-center">
              <BookOpen size={48} className="text-amber-400 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Welcome to Gamaliel AI Pastor</h2>
              <p className="text-gray-400 mb-6 max-w-md">
                Ask me anything about the Bible, theology, prayer, or Christian living.
                I'm here to guide you with Scripture-based wisdom.
              </p>
              <div className="grid grid-cols-2 gap-3 max-w-2xl">
                {[
                  'What does the Bible say about anxiety?',
                  'Explain the Sermon on the Mount',
                  'How can I grow in my faith?',
                  'What is the meaning of grace?',
                ].map(q => (
                  <button
                    key={q}
                    onClick={() => setInput(q)}
                    className="p-4 rounded-lg bg-[#1e293b] hover:bg-[#334155] border border-gray-700 text-left text-sm transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-4 ${
                  msg.role === 'user' ? 'justify-end' : ''
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
                    <BookOpen size={18} className="text-white" />
                  </div>
                )}
                <div
                  className={`px-4 py-3 rounded-2xl max-w-[80%] ${
                    msg.role === 'user'
                      ? 'bg-amber-600 text-white'
                      : 'bg-[#1e293b]'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <div className="prose prose-invert max-w-none prose-p:my-2 prose-headings:my-3">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p>{msg.content}</p>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
                    <User size={18} className="text-white" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
                  <BookOpen size={18} className="text-white" />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-[#1e293b]">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-gray-700 p-4">
          <form onSubmit={sendMessage} className="max-w-3xl mx-auto">
            <div className="flex gap-3 items-end">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(e as any);
                  }
                }}
                placeholder="Ask a biblical question..."
                rows={1}
                className="flex-1 bg-[#1e293b] border border-gray-700 rounded-2xl px-4 py-3 focus:outline-none focus:border-amber-500 resize-none max-h-40"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="p-3 rounded-full bg-amber-600 hover:bg-amber-500 disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={20} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
