'use client';
import { useState, useEffect, useRef } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { Send, Menu, X, Plus, LogOut, Book, Sparkles, Search } from 'lucide-react';

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

  useEffect(() => { checkAuth(); }, []);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

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
    <div className="flex h-screen bg-white text-black">
      {/* Sidebar Overlay */}
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/20 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed z-50 inset-y-0 left-0 w-72 bg-white border-r-2 border-black flex flex-col transition-transform duration-300 lg:relative lg:translate-x-0`}>
        <div className="p-5 border-b-2 border-black flex justify-between items-center">
          <h1 className="font-bold text-xl tracking-tighter uppercase">GAMALIEL</h1>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <button onClick={newChat} className="w-full flex items-center justify-center gap-2 py-2 border-2 border-black hover:bg-black hover:text-white transition-colors font-bold text-xs uppercase">
            <Plus className="w-4 h-4" /> New Chat
          </button>
          <div className="pt-4 border-t border-gray-200 space-y-1">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest px-1 mb-2">Select Model</p>
            <button onClick={() => setSelectedModel('MG')} className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 font-bold transition-colors ${selectedModel === 'MG' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}>
              <Sparkles className="w-3.5 h-3.5" /> MG Pastor
            </button>
            <button onClick={() => setSelectedModel('deep-theology')} className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 font-bold transition-colors ${selectedModel === 'deep-theology' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}>
              <Search className="w-3.5 h-3.5" /> Deep Theology
            </button>
          </div>
        </div>
        <div className="p-4 border-t-2 border-black space-y-2">
          {usageInfo && (
            <div className="bg-gray-50 border border-gray-200 p-3 text-[10px] font-mono space-y-1">
              <div className="flex justify-between"><span>MSGS</span><span>{usageInfo.used}/{usageInfo.limit}</span></div>
              <div className="h-1 bg-gray-200"><div className="h-1 bg-black" style={{width:`${(usageInfo.used/usageInfo.limit)*100}%`}}></div></div>
            </div>
          )}
          <button onClick={() => router.push('/dashboard')} className="w-full text-left text-[10px] font-bold uppercase tracking-widest hover:underline py-1">Dashboard</button>
          <button onClick={handleLogout} className="w-full text-left text-[10px] font-bold uppercase tracking-widest text-red-600 hover:underline py-1">Logout</button>
        </div>
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="border-b-2 border-black p-4 flex items-center gap-4 bg-white">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 border border-black"><Menu className="w-4 h-4" /></button>
          <div className="flex-1">
            <p className="font-bold text-[11px] tracking-widest uppercase">{selectedModel === 'deep-theology' ? 'Deep Theology Mode' : 'MG Pastor'}</p>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-2xl mx-auto space-y-6">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center text-center pt-24 space-y-4">
                <div className="border-2 border-black p-4"><Book className="w-8 h-8" /></div>
                <h3 className="text-xl font-bold uppercase tracking-tight">Theological Guidance</h3>
                <p className="text-xs text-gray-500 max-w-xs">{selectedModel === 'deep-theology' ? 'Deep analysis mode: textual, philosophical & archaeological sermon prep.' : 'Ask anything about the Bible, theology, or spiritual matters.'}</p>
              </div>
            )}
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`flex-shrink-0 w-7 h-7 flex items-center justify-center text-[9px] font-bold border border-black ${msg.role === 'user' ? 'bg-black text-white' : 'bg-white'}`}>
                  {msg.role === 'user' ? 'YOU' : 'GP'}
                </div>
                <div className={`flex-1 text-sm leading-relaxed ${msg.role === 'user' ? 'text-right' : ''}`}>
                  {msg.role === 'assistant' ? (
                    <div className="prose prose-sm prose-neutral max-w-none"><ReactMarkdown>{msg.content || (loading && idx === messages.length - 1 ? '...' : '')}</ReactMarkdown></div>
                  ) : (
                    <p className="whitespace-pre-wrap font-medium">{msg.content}</p>
                  )}
                </div>
              </div>
            ))}
            {loading && messages[messages.length - 1]?.content === '' && (
              <div className="flex gap-3"><div className="w-7 h-7 border border-black flex items-center justify-center text-[9px] font-bold">GP</div><div className="flex gap-1 items-center"><div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:'0ms'}}></div><div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:'150ms'}}></div><div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:'300ms'}}></div></div></div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </main>
        <footer className="border-t-2 border-black p-4 lg:p-6 bg-white">
          <div className="max-w-2xl mx-auto">
            <div className="flex gap-2 items-end border-2 border-black p-2">
              <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
                placeholder={selectedModel === 'deep-theology' ? 'Enter passage for deep analysis...' : 'Ask a question...'}
                disabled={loading} rows={1}
                className="flex-1 bg-transparent outline-none resize-none text-sm p-1 min-h-[32px] max-h-40 font-medium" />
              <button onClick={handleSend} disabled={!input.trim() || loading} className="p-2 bg-black text-white hover:bg-gray-800 disabled:bg-gray-300 transition-colors">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
