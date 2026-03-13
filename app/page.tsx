import Link from 'next/link';
import { BookOpen, MessageCircle, Globe, Shield, Zap, Users } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-[#050816] dark:to-slate-900">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="font-serif font-bold text-lg text-brand-700 dark:text-brand-300">Gamaliel AI Pastor</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/auth" className="btn-ghost text-sm">Sign in</Link>
          <Link href="/auth?mode=signup" className="btn-primary text-sm">Get started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 rounded-full px-4 py-1.5 text-brand-700 dark:text-brand-300 text-sm font-medium mb-6">
          <Zap className="w-3.5 h-3.5" />
          AI-powered Biblical guidance
        </div>
        <h1 className="text-4xl md:text-6xl font-serif font-bold text-slate-900 dark:text-slate-100 mb-6 leading-tight">
          Your personal<br />
          <span className="text-brand-600 dark:text-brand-400">Bible-based</span> counselor
        </h1>
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto leading-relaxed">
          Ask anything about Scripture, theology, life decisions, or faith. Gamaliel AI Pastor responds with wisdom grounded in the Bible.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/auth?mode=signup" className="btn-primary px-8 py-3 text-base">
            Start for free
          </Link>
          <Link href="/auth" className="btn-ghost px-8 py-3 text-base border border-slate-200 dark:border-slate-700">
            Sign in
          </Link>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-500 mt-4">Free to start. No credit card required.</p>
      </section>

      {/* Bible verse */}
      <section className="bg-brand-600 dark:bg-brand-800 py-10 px-6 text-center text-white">
        <p className="text-lg font-serif italic max-w-2xl mx-auto">
          "Your word is a lamp to my feet and a light to my path."
        </p>
        <p className="text-brand-200 text-sm mt-2">— Psalm 119:105</p>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 dark:text-slate-100 text-center mb-12">Everything you need for spiritual guidance</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: MessageCircle, title: 'Conversational Chat', desc: 'Natural conversation-style interface. Ask follow-up questions just like talking to a pastor.' },
            { icon: Globe, title: 'All Indian Languages', desc: 'Supports Hindi, Telugu, Tamil, Kannada, Malayalam, Gujarati, Bengali, and many more languages.' },
            { icon: BookOpen, title: 'Scripture-grounded', desc: 'Every response is carefully grounded in the Bible. No speculation, no contradictions.' },
            { icon: Shield, title: 'Trusted & Safe', desc: 'Answers verified against trusted Christian theology and Scripture.' },
            { icon: Zap, title: 'Instant Responses', desc: 'Fast, accurate answers available 24/7. No waiting for appointments.' },
            { icon: Users, title: 'For Everyone', desc: 'Designed for believers, seekers, and anyone who wants to understand the Bible better.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-brand-100 dark:bg-brand-900 rounded-lg flex items-center justify-center mb-3">
                <Icon className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">{title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-slate-50 dark:bg-slate-900 py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 dark:text-slate-100 text-center mb-12">Simple pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="font-bold text-xl text-slate-900 dark:text-slate-100 mb-1">Free</h3>
              <p className="text-3xl font-bold text-brand-600 dark:text-brand-400 mb-1">₹0 <span className="text-base font-normal text-slate-500">/ month</span></p>
              <p className="text-sm text-slate-500 mb-4">Get started at no cost</p>
              <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> 10 messages per day</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> All languages supported</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Basic Bible guidance</li>
              </ul>
              <Link href="/auth?mode=signup" className="btn-primary block text-center mt-6">Get started free</Link>
            </div>
            <div className="card border-brand-500 border-2">
              <div className="inline-block bg-brand-600 text-white text-xs font-bold px-2 py-0.5 rounded mb-2">POPULAR</div>
              <h3 className="font-bold text-xl text-slate-900 dark:text-slate-100 mb-1">Pro</h3>
              <p className="text-3xl font-bold text-brand-600 dark:text-brand-400 mb-1">₹299 <span className="text-base font-normal text-slate-500">/ month</span></p>
              <p className="text-sm text-slate-500 mb-4">For serious seekers</p>
              <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> 300 messages per day</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> All languages supported</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Priority responses</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Full conversation history</li>
              </ul>
              <Link href="/auth?mode=signup" className="btn-primary block text-center mt-6">Upgrade to Pro</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 px-6 text-center text-sm text-slate-500">
        <p>© 2026 Gamaliel AI Pastor. Answers based on the Bible and trusted Christian teaching.</p>
      </footer>
    </main>
  );
}
