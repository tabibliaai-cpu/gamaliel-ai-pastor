'use client';
import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { LogOut, MessageSquare, Crown, User, Zap, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  tier: 'free' | 'paid';
  created_at: string;
}

interface UsageStats {
  used: number;
  limit: number;
  tier: string;
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const supabase = createClientComponentClient();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        router.push('/auth');
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (!profileData) {
        const { data: newProfile } = await supabase
          .from('users')
          .upsert({
            id: session.user.id,
            email: session.user.email,
            full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
            tier: 'free',
            created_at: new Date().toISOString(),
          })
          .select()
          .single();
        setProfile(newProfile);
      } else {
        setProfile(profileData);
      }

      try {
        const res = await fetch('/api/usage');
        if (res.ok) setUsage(await res.json());
      } catch (e) {
        console.error('Usage fetch error:', e);
      }
    } catch (e) {
      console.error('loadData error:', e);
      setError('Failed to load profile. Please refresh.');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpgrade() {
    setUpgradeLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/billing/create-checkout', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setMessage('Error creating checkout. Please try again.');
      }
    } catch (e) {
      setMessage('Network error. Please try again.');
    } finally {
      setUpgradeLoading(false);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.push('/');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  const isPaid = profile?.tier === 'paid';
  const usagePercent = usage ? Math.min((usage.used / usage.limit) * 100, 100) : 0;
  const displayName = profile?.full_name || profile?.email?.split('@')[0] || 'User';

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <header className="border-b border-black dark:border-gray-800 px-4 py-3 flex items-center justify-between sticky top-0 bg-white dark:bg-black z-10">
        <div className="flex items-center gap-2">
          <span className="text-lg">✝</span>
          <span className="font-black text-sm uppercase tracking-widest">Gamaliel</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 border border-black dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => router.push('/chat')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-black dark:bg-white text-white dark:text-black text-[10px] font-bold uppercase tracking-widest hover:opacity-80 transition-opacity"
          >
            <MessageSquare className="w-3 h-3" />
            Chat
          </button>
          <button
            onClick={signOut}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-black dark:border-gray-700 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
          >
            <LogOut className="w-3 h-3" />
            Out
          </button>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-xl font-black uppercase tracking-tight">Dashboard</h1>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">Account Management</p>
        </div>

        {error && (
          <div className="border border-red-500 bg-red-50 dark:bg-red-950 px-3 py-2 text-[10px] font-bold uppercase text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {message && (
          <div className="border border-black dark:border-gray-600 bg-gray-50 dark:bg-gray-900 px-3 py-2 text-[10px] font-bold uppercase">
            {message}
          </div>
        )}

        <section className="space-y-3">
          <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Profile</p>
          <div className="border border-black dark:border-gray-600 p-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black dark:bg-white flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-white dark:text-black" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-sm uppercase truncate">{displayName}</p>
                <p className="text-[10px] text-gray-500 truncate">{profile?.email}</p>
              </div>
              <div className="flex-shrink-0">
                <span className={`text-[8px] font-black uppercase px-2 py-1 ${isPaid ? 'bg-black text-white dark:bg-white dark:text-black' : 'border border-black dark:border-gray-500'}`}>
                  {isPaid ? 'Pro' : 'Free'}
                </span>
              </div>
            </div>
            <div className="border-t border-gray-100 dark:border-gray-800 pt-3 grid grid-cols-2 gap-4 text-[10px]">
              <div>
                <p className="text-gray-400 uppercase font-bold">Joined</p>
                <p className="font-bold">{profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '-'}</p>
              </div>
              <div>
                <p className="text-gray-400 uppercase font-bold">Status</p>
                <p className="font-bold">{isPaid ? 'Pro User' : 'Basic'}</p>
              </div>
            </div>
          </div>
        </section>

        {usage && (
          <section className="space-y-3">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Daily Usage</p>
            <div className="border border-black dark:border-gray-600 p-4 space-y-3">
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-2xl font-black">{usage.used}</span>
                  <span className="text-gray-400 text-xs font-bold"> / {usage.limit}</span>
                </div>
                <span className="text-[9px] font-bold uppercase text-gray-500">messages</span>
              </div>
              <div className="h-1 bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${usagePercent >= 100 ? 'bg-red-500' : usagePercent >= 80 ? 'bg-yellow-500' : 'bg-black dark:bg-white'}`}
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
              {usage.used >= usage.limit && (
                <p className="text-[10px] font-bold text-red-600 uppercase">
                  Limit reached.{!isPaid && ' Upgrade for more.'}
                </p>
              )}
            </div>
          </section>
        )}

        <section className="space-y-3 pb-6">
          <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Plans</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className={`border border-black dark:border-gray-600 p-4 space-y-3 ${!isPaid ? 'shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.2)]' : 'opacity-60'}`}>
              <div className="flex justify-between items-start">
                <h3 className="font-black text-sm uppercase">Free</h3>
                {!isPaid && <span className="bg-black dark:bg-white text-white dark:text-black px-1.5 py-0.5 text-[8px] font-black uppercase">Active</span>}
              </div>
              <p className="text-xl font-black">₹0<span className="text-[10px] font-normal text-gray-400">/mo</span></p>
              <ul className="space-y-1">
                {['10 msgs/day', 'Gemini model', 'Bible Q&A'].map(f => (
                  <li key={f} className="text-[10px] font-bold uppercase flex items-center gap-1.5">
                    <span className="w-1 h-1 bg-black dark:bg-white rounded-full flex-shrink-0" />{f}
                  </li>
                ))}
              </ul>
            </div>

            <div className={`border-2 border-black dark:border-white p-4 space-y-3 ${isPaid ? 'shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.3)]' : ''}`}>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-black text-sm uppercase">Pro</h3>
                  <Crown className="w-3.5 h-3.5" />
                </div>
                {isPaid && <span className="bg-black dark:bg-white text-white dark:text-black px-1.5 py-0.5 text-[8px] font-black uppercase">Active</span>}
              </div>
              <p className="text-xl font-black">₹499<span className="text-[10px] font-normal text-gray-400">/mo</span></p>
              <ul className="space-y-1">
                {['500 msgs/day', 'High speed', 'Deep Theology'].map(f => (
                  <li key={f} className="text-[10px] font-bold uppercase flex items-center gap-1.5">
                    <span className="w-1 h-1 bg-black dark:bg-white rounded-full flex-shrink-0" />{f}
                  </li>
                ))}
              </ul>
              {!isPaid && (
                <button
                  onClick={handleUpgrade}
                  disabled={upgradeLoading}
                  className="w-full py-2 bg-black dark:bg-white text-white dark:text-black font-black uppercase text-[10px] tracking-widest hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-1"
                >
                  <Zap className="w-3 h-3" />
                  {upgradeLoading ? '...' : 'Upgrade'}
                </button>
              )}
            </div>
          </div>
        </section>
      </main>

      <div className="sm:hidden fixed bottom-6 right-6 z-20">
        <button
          onClick={() => router.push('/chat')}
          className="bg-black dark:bg-white text-white dark:text-black p-3.5 rounded-full shadow-2xl"
        >
          <MessageSquare className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
