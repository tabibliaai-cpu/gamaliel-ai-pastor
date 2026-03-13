'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

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
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push('/auth'); return; }

    const { data: profileData } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();
    setProfile(profileData);

    const res = await fetch('/api/usage');
    if (res.ok) setUsage(await res.json());
    setLoading(false);
  }

  async function handleUpgrade() {
    setUpgradeLoading(true);
    const res = await fetch('/api/billing/create-checkout', { method: 'POST' });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      setMessage('Error creating checkout session. Please try again.');
    }
    setUpgradeLoading(false);
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.push('/');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center">
        <div className="text-amber-400 text-xl">Loading...</div>
      </div>
    );
  }

  const isPaid = profile?.tier === 'paid';

  return (
    <div className="min-h-screen bg-[#1a1a2e] text-gray-100">
      {/* Header */}
      <header className="bg-[#16213e] border-b border-gray-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">✝️</span>
          <h1 className="font-bold text-lg text-amber-400">Gamaliel AI Pastor</h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/chat')}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm"
          >Go to Chat</button>
          <button
            onClick={signOut}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm"
          >Sign Out</button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <h2 className="text-2xl font-bold text-amber-400">My Dashboard</h2>

        {message && (
          <div className="bg-red-900/50 border border-red-500 text-red-300 rounded-lg px-4 py-3 text-sm">{message}</div>
        )}

        {/* Profile Card */}
        <div className="bg-[#16213e] rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-amber-400">Profile</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Name</p>
              <p className="text-sm font-medium mt-1">{profile?.full_name || 'Not set'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Email</p>
              <p className="text-sm font-medium mt-1">{profile?.email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Member Since</p>
              <p className="text-sm font-medium mt-1">
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '-'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Plan</p>
              <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold ${
                isPaid ? 'bg-amber-500 text-black' : 'bg-gray-600 text-gray-200'
              }`}>
                {isPaid ? 'Paid' : 'Free'}
              </span>
            </div>
          </div>
        </div>

        {/* Usage Card */}
        {usage && (
          <div className="bg-[#16213e] rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-amber-400">Today&apos;s Usage</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-2">
                  <span>{usage.used} messages used</span>
                  <span className="text-gray-400">{usage.limit} limit</span>
                </div>
                <div className="bg-gray-700 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      usage.used >= usage.limit ? 'bg-red-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min((usage.used / usage.limit) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <span className="text-2xl font-bold text-amber-400">
                {Math.round((usage.used / usage.limit) * 100)}%
              </span>
            </div>
            {usage.used >= usage.limit && (
              <p className="text-red-400 text-sm mt-3">
                Daily limit reached. {!isPaid && 'Upgrade to get more messages!'}
              </p>
            )}
          </div>
        )}

        {/* Plans */}
        <div id="upgrade" className="bg-[#16213e] rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-6 text-amber-400">Plans</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Free Plan */}
            <div className={`rounded-xl border-2 p-5 ${
              !isPaid ? 'border-amber-500 bg-[#0f3460]' : 'border-gray-600'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-lg">Free</h4>
                {!isPaid && <span className="bg-amber-500 text-black text-xs px-2 py-1 rounded-full font-semibold">Current</span>}
              </div>
              <p className="text-3xl font-bold mb-1">$0<span className="text-sm text-gray-400">/mo</span></p>
              <ul className="text-sm text-gray-300 space-y-2 mt-4">
                <li className="flex items-center gap-2"><span className="text-amber-400">✓</span> 10 messages/day</li>
                <li className="flex items-center gap-2"><span className="text-amber-400">✓</span> All languages</li>
                <li className="flex items-center gap-2"><span className="text-amber-400">✓</span> Bible Q&A</li>
                <li className="flex items-center gap-2"><span className="text-gray-500">✕</span> Priority support</li>
              </ul>
            </div>

            {/* Paid Plan */}
            <div className={`rounded-xl border-2 p-5 ${
              isPaid ? 'border-amber-500 bg-[#0f3460]' : 'border-gray-600'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-lg">Pro</h4>
                {isPaid && <span className="bg-amber-500 text-black text-xs px-2 py-1 rounded-full font-semibold">Current</span>}
              </div>
              <p className="text-3xl font-bold mb-1">$9<span className="text-sm text-gray-400">/mo</span></p>
              <ul className="text-sm text-gray-300 space-y-2 mt-4">
                <li className="flex items-center gap-2"><span className="text-amber-400">✓</span> 500 messages/day</li>
                <li className="flex items-center gap-2"><span className="text-amber-400">✓</span> All languages</li>
                <li className="flex items-center gap-2"><span className="text-amber-400">✓</span> Bible Q&A</li>
                <li className="flex items-center gap-2"><span className="text-amber-400">✓</span> Priority support</li>
              </ul>
              {!isPaid && (
                <button
                  onClick={handleUpgrade}
                  disabled={upgradeLoading}
                  className="mt-5 w-full py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  {upgradeLoading ? 'Redirecting...' : 'Upgrade to Pro'}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
