'use client';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Eye, EyeOff, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';

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
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState(searchParams.get('error') === 'oauth_failed' ? 'Google sign-in failed. Please try again.' : '');
  const [success, setSuccess] = useState('');
  const supabase = createClientComponentClient();
  const { theme, setTheme } = useTheme();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        });
        if (error) throw error;
        setSuccess('Check your email for the confirmation link!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    });
    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
    // Don't reset loading - page will redirect
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-xs space-y-5">

        {/* Theme toggle */}
        <div className="flex justify-end">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle dark mode"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        {/* Logo */}
        <div className="text-center space-y-1">
          <div className="text-2xl">✝</div>
          <h1 className="text-xl font-black uppercase tracking-tight dark:text-white">Gamaliel</h1>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest">AI Theological Guidance</p>
        </div>

        {/* Auth card */}
        <div className="border border-black dark:border-gray-600">
          <div className="flex border-b border-black dark:border-gray-600">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
              className={`flex-1 py-2.5 text-[11px] font-black uppercase tracking-widest transition-colors ${
                mode === 'login'
                  ? 'bg-black text-white dark:bg-white dark:text-black'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-900 dark:text-gray-300'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(''); setSuccess(''); }}
              className={`flex-1 py-2.5 text-[11px] font-black uppercase tracking-widest transition-colors ${
                mode === 'signup'
                  ? 'bg-black text-white dark:bg-white dark:text-black'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-900 dark:text-gray-300'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleEmailAuth} className="p-4 space-y-3">
            {mode === 'signup' && (
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 outline-none text-sm bg-white dark:bg-gray-900 dark:text-white focus:border-black dark:focus:border-gray-400 transition-colors"
                  placeholder="John Doe"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 outline-none text-sm bg-white dark:bg-gray-900 dark:text-white focus:border-black dark:focus:border-gray-400 transition-colors"
                placeholder="email@example.com"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 outline-none text-sm bg-white dark:bg-gray-900 dark:text-white focus:border-black dark:focus:border-gray-400 transition-colors pr-9"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="border border-red-400 bg-red-50 dark:bg-red-950 px-3 py-2 text-[10px] font-bold text-red-700 dark:text-red-400 uppercase">
                {error}
              </div>
            )}

            {success && (
              <div className="border border-green-400 bg-green-50 dark:bg-green-950 px-3 py-2 text-[10px] font-bold text-green-700 dark:text-green-400 uppercase">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-black dark:bg-white text-white dark:text-black text-[11px] font-black uppercase tracking-widest hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Signing in...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="px-4 pb-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              <span className="text-[10px] font-bold uppercase text-gray-400">Or</span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            </div>
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="w-full py-2.5 border border-gray-300 dark:border-gray-600 text-[11px] font-bold uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-gray-900 dark:text-gray-200 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
            >
              {googleLoading ? (
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              {googleLoading ? 'Redirecting...' : 'Continue with Google'}
            </button>
          </div>
        </div>

        <p className="text-center text-[10px] text-gray-400 uppercase tracking-widest">
          {mode === 'login' ? (
            <>No account?{' '}<button type="button" onClick={() => { setMode('signup'); setError(''); }} className="font-black text-black dark:text-white hover:underline">Sign up free</button></>
          ) : (
            <>Have an account?{' '}<button type="button" onClick={() => { setMode('login'); setError(''); }} className="font-black text-black dark:text-white hover:underline">Sign in</button></>
          )}
        </p>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <AuthPageContent />
    </Suspense>
  );
}
