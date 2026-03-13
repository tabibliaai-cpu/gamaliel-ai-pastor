'use client';

import { useState, useEffect, useRef } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
  { code: 'kn', name: 'Kannada' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'mr', name: 'Marathi' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'pa', name: 'Punjabi' },
  { code: 'bn', name: 'Bengali' },
  { code: 'or', name: 'Odia' },
  { code: 'as', name: 'Assamese' },
  { code: 'ur', name: 'Urdu' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ar', name: 'Arabic' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('en');
  const [usageInfo, setUsageInfo] = useState<{ used: number; limit: number; tier: string } | null>(null);
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchUsage();
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

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, language, history: messages }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'An error occurred');
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
        fetchUsage();
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.push('/');
  }

  const dm = darkMode;

  return (
    <div className={`flex flex-col h-screen ${dm ? 'bg-[#1a1a2e] text-gray-100' : 'bg-[#fdf6e3] text-gray-900'}`}>
      {/* Header */}
      <header className={`flex items-center justify-between px-4 py-3 border-b ${dm ? 'border-gray-700 bg-[#16213e]' : 'border-amber-200 bg-amber-50'}`}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">✝️</span>
          <div>
            <h1 className="font-bold text-lg text-amber-400">Gamaliel AI Pastor</h1>
            <p className="text-xs text-gray-400">Guided by Scripture</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={language}
            onChange={e => setLanguage(e.target.value)}
            className={`text-sm rounded px-2 py-1 border ${dm ? 'bg-[#1a1a2e] border-gray-600 text-gray-200' : 'bg-white border-amber-300'}`}
          >
            {LANGUAGES.map(l => (
              <option key={l.code} value={l.code}>{l.name}</option>
            ))}
          </select>
          <button onClick={() => setDarkMode(!dm)} className="text-xl" title="Toggle theme">
            {dm ? '☀️' : '🌙'}
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-sm px-3 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white"
          >Dashboard</button>
          <button onClick={signOut} className="text-sm px-3 py-1 rounded bg-gray-600 hover:bg-gray-700 text-white">Sign Out</button>
        </div>
      </header>

      {/* Usage bar */}
      {usageInfo && (
        <div className={`px-4 py-2 text-xs flex items-center gap-2 ${dm ? 'bg-[#0f3460]' : 'bg-amber-100'}`}>
          <span className="font-semibold uppercase text-amber-400">{usageInfo.tier}</span>
          <span className={dm ? 'text-gray-300' : 'text-gray-600'}>
            {usageInfo.used} / {usageInfo.limit} messages today
          </span>
          <div className="flex-1 bg-gray-700 rounded-full h-1.5 max-w-xs">
            <div
              className="bg-amber-500 h-1.5 rounded-full transition-all"
              style={{ width: `${Math.min((usageInfo.used / usageInfo.limit) * 100, 100)}%` }}
            />
          </div>
          {usageInfo.tier === 'free' && (
            <button
              onClick={() => router.push('/dashboard#upgrade')}
              className="ml-auto text-amber-400 underline hover:text-amber-300"
            >Upgrade</button>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-4">
            <span className="text-6xl">✝️</span>
            <h2 className="text-2xl font-semibold text-amber-400">Welcome to Gamaliel AI Pastor</h2>
            <p className={`text-sm max-w-md ${dm ? 'text-gray-400' : 'text-gray-500'}`}>
              Ask me anything about the Bible, theology, prayer, Christian living, or seek spiritual guidance.
              I respond in your chosen language.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-left max-w-lg w-full">
              {[
                'What does the Bible say about anxiety?',
                'Explain the Sermon on the Mount',
                'How can I grow in my faith?',
                'What is the meaning of grace?',
              ].map(q => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className={`p-3 rounded-lg text-sm border text-left hover:border-amber-400 transition-colors ${
                    dm ? 'bg-[#16213e] border-gray-700' : 'bg-white border-amber-200'
                  }`}
                >{q}</button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-3 ${
              msg.role === 'user'
                ? 'bg-amber-600 text-white rounded-br-sm'
                : dm ? 'bg-[#16213e] text-gray-100 rounded-bl-sm border border-gray-700' : 'bg-white text-gray-900 rounded-bl-sm border border-amber-200'
            }`}>
              {msg.role === 'assistant' ? (
                <div className="prose prose-sm max-w-none prose-invert">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className={`rounded-2xl px-4 py-3 ${dm ? 'bg-[#16213e] border border-gray-700' : 'bg-white border border-amber-200'}`}>
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        {error && (
          <div className="flex justify-center">
            <div className="bg-red-900/50 border border-red-500 text-red-300 rounded-lg px-4 py-2 text-sm">
              {error}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className={`border-t px-4 py-3 ${dm ? 'border-gray-700 bg-[#16213e]' : 'border-amber-200 bg-amber-50'}`}>
        <form onSubmit={sendMessage} className="flex gap-2 max-w-4xl mx-auto">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask a biblical question..."
            disabled={loading}
            className={`flex-1 rounded-xl px-4 py-3 text-sm border focus:outline-none focus:ring-2 focus:ring-amber-500 ${
              dm ? 'bg-[#1a1a2e] border-gray-600 text-gray-100 placeholder-gray-500' : 'bg-white border-amber-300 text-gray-900'
            }`}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-5 py-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
