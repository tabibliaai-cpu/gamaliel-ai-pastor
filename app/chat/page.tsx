'use client';
import { useState, useEffect, useRef } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { Send, Menu, X, Plus, LogOut, Book, Sparkles } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface UsageInfo {
  used: number;
  limit: number;
  tier: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [usageInfo, setUsageInfo] = useState<UsageInfo | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) router.push('/login');
  }

  async function handleSend() {
    if (!input.trim() || loading) return;
    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });
      const data = await res.json();
      if (data.error) {
        setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${data.error}` }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
        if (data.usage) setUsageInfo({ used: data.usage.messagesUsed, limit: data.usage.dailyLimit, tier: data.usage.plan });
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Failed to send message. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 shadow-2xl transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 transition-transform duration-300 ease-in-out border-r border-slate-200 dark:border-slate-700`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Book className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Gamaliel AI
                </h1>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <button onClick={() => { setMessages([]); }} className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-3 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
              <Plus className="w-5 h-5" />
              <span>New Chat</span>
            </button>
          </div>

          {/* Usage Info */}
          {usageInfo && (
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-indigo-100 dark:border-indigo-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Daily Usage</span>
                  <span className="text-xs font-semibold px-2 py-1 bg-indigo-600 text-white rounded-full">{usageInfo.tier}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">{usageInfo.used} / {usageInfo.limit}</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{Math.round((usageInfo.used / usageInfo.limit) * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 h-full rounded-full transition-all duration-500" style={{ width: `${(usageInfo.used / usageInfo.limit) * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            <button onClick={handleSignOut} className="w-full flex items-center justify-center space-x-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 px-4 py-3 rounded-xl font-medium transition-all">
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
            <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-4">Biblical guidance powered by AI</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-72">
        {/* Top Bar */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-lg transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="font-semibold text-slate-800 dark:text-slate-200">Gamaliel AI Pastor</h2>
          </div>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          {messages.length === 0 ? (
            <div className="max-w-3xl mx-auto text-center py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 mb-6">
                <Book className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-3">Peace be with you</h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">I am Gamaliel, your AI Biblical companion. How may I serve your spiritual growth today?</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                {['What does the Bible say about anxiety?', 'Explain the Sermon on the Mount', 'How can I grow in my faith?', 'What is the meaning of grace?'].map((q) => (
                  <button key={q} onClick={() => setInput(q)} className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 p-4 rounded-xl text-left border border-slate-200 dark:border-slate-700 transition-all hover:shadow-lg hover:-translate-y-0.5 group">
                    <p className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{q}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-5 py-3 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-md border border-slate-200 dark:border-slate-700'
                  }`}>
                    {msg.role === 'assistant' ? (
                      <div className="prose dark:prose-invert prose-sm max-w-none">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm px-4 py-4">
          <div className="max-w-3xl mx-auto">
            <div className="relative flex items-center bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 focus-within:ring-2 focus-within:ring-indigo-500 dark:focus-within:ring-indigo-400 transition-all">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Ask Gamaliel a question..."
                disabled={loading}
                className="flex-1 bg-transparent px-6 py-4 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="mr-2 p-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-3">Gamaliel AI Pastor provides Biblical guidance but is not a substitute for pastoral care or Scripture study.</p>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/50 z-40 lg:hidden" />
      )}
    </div>
  );
}
