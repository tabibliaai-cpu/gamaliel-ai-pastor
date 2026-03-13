'use client';
import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { LogOut, MessageSquare, Crown, User, Zap } from 'lucide-react';

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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  const isPaid = profile?.tier === 'paid';
  const usagePercent = usage ? Math.min((usage.used / usage.limit) * 100, 100) : 0;
  const displayName = profile?.full_name || profile?.email?.split('@')[0] || 'User';

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-black px-6 py-4 flex items-center justify-between sticky top-0 bg-white z-10">
        <div className="flex items-center gap-2">
          <span className="text-lg">✝</span>
          <span className="font-black text-sm uppercase tracking-widest">Gamaliel</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/chat')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-black text-white text-[11px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
          >
            <MessageSquare className="w-3 h-3" />
            Chat
          </button>
          <button
            onClick={signOut}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-black text-[11px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors"
          >
            <LogOut className="w-3 h-3" />
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10 space-y-10">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight">Dashboard</h1>
          <p className="text-[11px] text-gray-500 uppercase tracking-widest mt-1">Manage your account</p>
        </div>

        {error && (
          <div className="border border-red-500 bg-red-50 px-4 py-3 text-[11px] font-bold uppercase text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="border border-black bg-gray-50 px-4 py-3 text-[11px] font-bold uppercase">
            {message}
          </div>
        )}

        <section className="space-y-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Profile</p>
          <div className="border border-black p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-sm uppercase">{displayName}</p>
                <p className="text-[11px] text-gray-500">{profile?.email}</p>
              </div>
              <div className="ml-auto">
                <span className={`text-[9px] font-black uppercase px-2 py-1 ${isPaid ? 'bg-black text-white' : 'border border-black'}`}>
                  {isPaid ? 'Pro' : 'Free'}
                </span>
              </div>
            </div>
            <div className="border-t border-gray-100 pt-4 grid grid-cols-2 gap-4 text-[11px]">
              <div>
                <p className="text-gray-400 uppercase font-bold">Member Since</p>
                <p className="font-bold mt-0.5">{profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}</p>
              </div>
              <div>
                <p className="text-gray-400 uppercase font-bold">Plan</p>
                <p className="font-bold mt-0.5">{isPaid ? 'Pro — ₹499/mo' : 'Free'}</p>
              </div>
            </div>
          </div>
        </section>

        {usage && (
          <section className="space-y-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Today&apos;s Usage</p>
            <div className="border border-black p-6 space-y-3">
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-3xl font-black">{usage.used}</span>
                  <span className="text-gray-400 text-sm font-bold"> / {usage.limit}</span>
                </div>
                <span className="text-[10px] font-bold uppercase text-gray-500">messages today</span>
              </div>
              <div className="h-1.5 bg-gray-100 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${usagePercent >= 100 ? 'bg-red-500' : usagePercent >= 80 ? 'bg-yellow-500' : 'bg-black'}`}
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
              {usage.used >= usage.limit && (
                <p className="text-[11px] font-bold text-red-600 uppercase">
                  Daily limit reached.{!isPaid && ' Upgrade to Pro for more messages.'}
                </p>
              )}
            </div>
          </section>
        )}

        <section className="space-y-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Select Plan</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className={`border border-black p-5 space-y-4 ${!isPaid ? 'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'opacity-60'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-black text-base uppercase">Free</h3>
                  <p className="text-[9px] text-gray-400 uppercase tracking-widest mt-0.5">Basic Access</p>
                </div>
                {!isPaid && <span className="bg-black text-white px-2 py-0.5 text-[9px] font-black uppercase">Current</span>}
              </div>
              <p className="text-2xl font-black">₹0<span className="text-xs font-normal text-gray-400">/mo</span></p>
              <ul className="space-y-1.5">
                {['10 messages/day', 'Gemini model', 'All Indian languages', 'Basic theology Q&A'].map(f => (
                  <li key={f} className="text-[11px] font-bold uppercase flex items-center gap-2">
                    <span className="w-1 h-1 bg-black rounded-full inline-block flex-shrink-0" />{f}
                  </li>
                ))}
              </ul>
            </div>

            <div className={`border-2 border-black p-5 space-y-4 ${isPaid ? 'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : ''}`}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-black text-base uppercase">Pro</h3>
                    <Crown className="w-4 h-4" />
                  </div>
                  <p className="text-[9px] text-gray-400 uppercase tracking-widest mt-0.5">Full Access</p>
                </div>
                {isPaid && <span className="bg-black text-white px-2 py-0.5 text-[9px] font-black uppercase">Current</span>}
              </div>
              <p className="text-2xl font-black">₹499<span className="text-xs font-normal text-gray-400">/mo</span></p>
              <ul className="space-y-1.5">
                {['500 messages/day', 'Gemini model (fast)', 'Deep Theology mode', 'All Indian languages', 'Priority access'].map(f => (
                  <li key={f} className="text-[11px] font-bold uppercase flex items-center gap-2">
                    <span className="w-1 h-1 bg-black rounded-full inline-block flex-shrink-0" />{f}
                  </li>
                ))}
              </ul>
              {!isPaid && (
                <button
                  onClick={handleUpgrade}
                  disabled={upgradeLoading}
                  className="w-full py-2.5 bg-black text-white font-black uppercase text-[11px] tracking-widest hover:bg-gray-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  <Zap className="w-3 h-3" />
                  {upgradeLoading ? 'Redirecting...' : 'Upgrade to Pro — ₹499/mo'}
                </button>
              )}
            </div>
          </div>
        </section>
      </main>

      <div className="sm:hidden fixed bottom-6 right-6 z-20">
        <button
          onClick={() => router.push('/chat')}
          className="bg-black text-white p-4 rounded-full shadow-2xl"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
