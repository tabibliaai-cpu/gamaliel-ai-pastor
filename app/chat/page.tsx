'use client';
import { useState, useEffect, useRef } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { Send, Menu, X, Plus, LogOut, LayoutDashboard, Book, Sparkles, Sun, Moon, Loader2 } from 'lucide-react';
import { useTheme } from 'next-themes';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [usageInfo, setUsageInfo] = useState<{used: number; limit: number; tier: string} | null>(null);
  const [selectedModel, setSelectedModel] = useState<'MG' | 'deep-theology'>('MG');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClientComponentClient();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) router.push('/auth');
  }

  async function handleSend() {
    if (!input.trim() || loading) return;
    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, conversationId, model: selectedModel }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error === 'LIMIT_REACHED') {
          setMessages(prev => [...prev, { role: 'assistant', content: 'Daily limit reached. Please upgrade in your dashboard to continue.' }]);
        } else {
          throw new Error('Failed');
        }
        setLoading(false);
        return;
      }

      const used = response.headers.get('X-Usage-Used');
      const limit = response.headers.get('X-Usage-Limit');
      const tier = response.headers.get('X-Usage-Plan');
      const newConvId = response.headers.get('X-Conversation-Id');

      if (used && limit) setUsageInfo({ used: parseInt(used), limit: parseInt(limit), tier: tier || 'free' });
      if (newConvId) setConversationId(newConvId);

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader');

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const data = JSON.parse(line.slice(6));
              const content = data.choices?.[0]?.delta?.content || '';
              if (content) {
                fullContent += content;
                setMessages(prev => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1].content = fullContent;
                  return newMessages;
                });
              }
            } catch (e) {}
          }
        }
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/auth');
  }

  function newChat() {
    setMessages([]);
    setConversationId(null);
    setInput('');
  }

  return (
    <div className="flex h-screen bg-white dark:bg-[#0d0d0d] text-gray-900 dark:text-gray-100 transition-colors overflow-hidden">
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/40 lg:hidden transition-opacity" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-gray-50 dark:bg-[#111111] border-r border-gray-200 dark:border-gray-800 flex flex-col transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-800">
          <h1 className="text-lg font-semibold tracking-tight">Gamaliel</h1>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          <button 
            onClick={newChat}
            className="w-full flex items-center gap-3 px-3 py-2.5 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-[#222] transition-all shadow-sm group"
          >
            <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
            New Chat
          </button>

          <div className="space-y-1">
            <p className="px-3 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Model</p>
            <button 
              onClick={() => setSelectedModel('MG')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${selectedModel === 'MG' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-100 dark:hover:bg-[#1a1a1a]'}`}
            >
              <Sparkles className="w-4 h-4" />
              MG Pastor
            </button>
            <button 
              onClick={() => setSelectedModel('deep-theology')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${selectedModel === 'deep-theology' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-100 dark:hover:bg-[#1a1a1a]'}`}
            >
              <Book className="w-4 h-4" />
              Deep Theology
            </button>
          </div>
        </div>

        <div className="p-3 border-t border-gray-200 dark:border-gray-800 space-y-1">
          {usageInfo && (
            <div className="px-3 py-2 mb-2 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
              <div className="flex justify-between text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase mb-1">
                <span>Usage</span>
                <span>{usageInfo.used}/{usageInfo.limit}</span>
              </div>
              <div className="h-1 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 dark:bg-blue-500 transition-all duration-500" style={{ width: `${(usageInfo.used / usageInfo.limit) * 100}%` }} />
              </div>
            </div>
          )}
          
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition-colors">
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button onClick={() => router.push('/dashboard')} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition-colors">
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </button>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Chat */}
      <main className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#0d0d0d]">
        {/* Mobile Header */}
        <header className="lg:hidden h-14 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 shrink-0 bg-white/80 dark:bg-[#0d0d0d]/80 backdrop-blur-md sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-sm font-semibold">{selectedModel === 'deep-theology' ? 'Deep Theology' : 'MG Pastor'}</h1>
          <div className="w-9" /> {/* Spacer */}
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mb-2">
                  <Sparkles className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight">Theological Guidance</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
                  {selectedModel === 'deep-theology' 
                    ? 'Deep analysis mode: exploring original texts, philosophical contexts, and archaeological findings.' 
                    : 'Ask anything about the Bible, theology, or spiritual matters for clear, biblically-grounded guidance.'}
                </p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-4 md:gap-6 ${msg.role === 'assistant' ? 'items-start' : 'flex-row-reverse items-start'}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-bold text-[10px] ${msg.role === 'user' ? 'bg-gray-900 dark:bg-white text-white dark:text-black' : 'bg-blue-600 text-white'}`}>
                    {msg.role === 'user' ? 'YOU' : 'GP'}
                  </div>
                  <div className={`flex-1 min-w-0 pt-1.5 ${msg.role === 'user' ? 'text-right' : ''}`}>
                    {msg.role === 'assistant' ? (
                      <div className="prose dark:prose-invert prose-sm max-w-none text-gray-800 dark:text-gray-200 leading-relaxed">
                        <ReactMarkdown>{msg.content || (loading && idx === messages.length - 1 ? '...' : '')}</ReactMarkdown>
                      </div>
                    ) : (
                      <div className="inline-block bg-gray-100 dark:bg-[#1a1a1a] px-4 py-2.5 rounded-2xl text-sm text-gray-800 dark:text-gray-200 leading-relaxed border border-gray-200 dark:border-gray-800">
                        {msg.content}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            {loading && messages[messages.length - 1]?.content === '' && (
              <div className="flex gap-4 md:gap-6 items-start">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                </div>
                <div className="pt-2 text-gray-400">Thinking...</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <footer className="p-4 bg-white dark:bg-[#0d0d0d] border-t border-gray-200 dark:border-gray-800">
          <div className="max-w-3xl mx-auto relative group">
            <div className="relative flex items-end bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-2xl focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500 transition-all shadow-sm">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={selectedModel === 'deep-theology' ? 'Enter passage for deep analysis...' : 'Ask a question...'}
                disabled={loading}
                rows={1}
                className="flex-1 bg-transparent outline-none resize-none text-sm p-4 min-h-[56px] max-h-40 font-normal leading-relaxed text-gray-900 dark:text-gray-100 placeholder-gray-500"
              />
              <div className="p-2">
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  className="p-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-xl disabled:bg-gray-300 dark:disabled:bg-gray-800 disabled:text-gray-500 transition-all shadow-sm hover:scale-105 active:scale-95"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="mt-2 text-[10px] text-center text-gray-400">
              Gamaliel provides AI theological insights. Always verify with Scripture.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
