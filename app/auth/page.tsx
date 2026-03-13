'use client';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { Eye, EyeOff, BookOpen } from 'lucide-react';

function AuthPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const supabase = createPagesBrowserClient();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: name }, emailRedirectTo: `${window.location.origin}/auth/callback` }
        });
        if (error) throw error;
        alert('Check your email for the confirmation link!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    });
  };

  return (
    <div className="min-h-screen bg-white text-black flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-10">
        <div className="text-center space-y-3">
          <div className="inline-block p-4 border-2 border-black">
            <BookOpen className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold tracking-tighter uppercase">Gamaliel</h1>
          <p className="text-xs font-bold tracking-[0.2em] text-gray-500 uppercase">AI Theological Guidance</p>
        </div>
        <div className="border-2 border-black p-8 space-y-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex border-b border-black">
            <button onClick={() => setMode('login')}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest ${mode === 'login' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}>Login</button>
            <button onClick={() => setMode('signup')}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest ${mode === 'signup' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}>Sign Up</button>
          </div>
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest">Full Name</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 border border-black outline-none text-sm font-medium" placeholder="John Doe" />
              </div>
            )}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-black outline-none text-sm font-medium" placeholder="email@example.com" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 border border-black outline-none text-sm font-medium" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {error && <p className="text-[10px] font-bold text-red-600 uppercase">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full py-4 bg-black text-white font-bold uppercase text-xs tracking-widest hover:bg-gray-800 disabled:opacity-50 transition-all">
              {loading ? 'Processing...' : mode === 'login' ? 'Enter' : 'Create Account'}
            </button>
          </form>
          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-black"></div></div>
            <div className="relative flex justify-center text-[10px] font-bold uppercase"><span className="bg-white px-4">Or</span></div>
          </div>
          <button onClick={handleGoogleLogin}
            className="w-full py-3 border border-black flex items-center justify-center gap-3 hover:bg-gray-50 font-bold text-xs uppercase tracking-widest">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.27.81-.57z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center">Loading...</div>}>
      <AuthPageContent />
    </Suspense>
  );
}
