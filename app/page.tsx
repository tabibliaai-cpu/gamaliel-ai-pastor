import Link from 'next/link';
import { BookOpen, MessageCircle, Globe, Shield, Zap, Users, ArrowRight, Check } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans selection:bg-brand-100 dark:selection:bg-brand-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-slate-200/50 dark:border-slate-800/50 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 group cursor-pointer">
              <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
                Gamaliel AI
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm font-medium hover:text-brand-600 transition-colors hidden sm:block">
                Sign in
              </Link>
              <Link 
                href="/register" 
                className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-2.5 rounded-full text-sm font-semibold hover:opacity-90 transition-all shadow-md active:scale-95"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-blue-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-900/30 border border-brand-100 dark:border-brand-800 mb-8 animate-fade-in">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-300">
                New: Multilingual Support Added
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
              Your Personal <br />
              <span className="text-brand-600 bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-indigo-600">
                Bible-Based Counselor
              </span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 leading-relaxed">
              Experience wise, compassionate guidance grounded in Scripture. Ask about theology, life decisions, or faith in any major Indian language.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/register" 
                className="w-full sm:w-auto bg-brand-600 text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-brand-700 transition-all shadow-xl shadow-brand-500/25 flex items-center justify-center gap-2 group"
              >
                Start Your Journey <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/login" 
                className="w-full sm:w-auto bg-slate-100 dark:bg-slate-800 px-8 py-4 rounded-full text-lg font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                Sign In
              </Link>
            </div>
            
            <div className="mt-12 flex items-center justify-center gap-8 text-slate-400 grayscale opacity-70">
              <div className="flex items-center gap-1.5"><Zap className="w-5 h-5" /> <span className="text-sm font-medium">Instant Responses</span></div>
              <div className="flex items-center gap-1.5"><Shield className="w-5 h-5" /> <span className="text-sm font-medium">Safe & Secure</span></div>
              <div className="flex items-center gap-1.5"><Globe className="w-5 h-5" /> <span className="text-sm font-medium">Multilingual</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Everything You Need</h2>
            <p className="text-slate-600 dark:text-slate-400">Thoughtfully designed features for your spiritual growth.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { 
                icon: MessageCircle, 
                title: 'Conversational Chat', 
                desc: 'Talk naturally like you would with a trusted pastor. Gamaliel remembers context for meaningful follow-ups.' 
              },
              { 
                icon: Globe, 
                title: 'All Indian Languages', 
                desc: 'Communicate in Hindi, Telugu, Tamil, Kannada, and more. Language is no barrier to spiritual wisdom.' 
              },
              { 
                icon: BookOpen, 
                title: 'Scripture-Grounded', 
                desc: 'Every response is strictly cross-referenced with Biblical texts to ensure theological accuracy.' 
              },
              { 
                icon: Shield, 
                title: 'Private & Secure', 
                desc: 'Your spiritual journey is personal. Conversations are encrypted and handled with the utmost confidentiality.' 
              },
              { 
                icon: Zap, 
                title: '24/7 Availability', 
                desc: 'Spiritual questions don\'t wait for office hours. Gamaliel is here for you whenever you need guidance.' 
              },
              { 
                icon: Users, 
                title: 'Community Focused', 
                desc: 'Designed to complement your local church life and deepen your personal study of the Word.' 
              },
            ].map((f, i) => (
              <div key={i} className="p-8 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 hover:border-brand-500 transition-all duration-300 shadow-sm group">
                <div className="w-12 h-12 bg-brand-50 dark:bg-brand-900/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <f.icon className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                </div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-white">Simple Pricing</h2>
            <p className="text-slate-600 dark:text-slate-400">Choose the plan that fits your spiritual journey.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 relative overflow-hidden flex flex-col h-full">
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">Free Plan</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-slate-900 dark:text-white">₹0</span>
                  <span className="text-slate-500">/month</span>
                </div>
                <p className="text-sm text-slate-500 mt-2">Perfect for getting started</p>
              </div>
              <ul className="space-y-4 mb-8 flex-1 text-slate-900 dark:text-white">
                {[
                  '10 messages per day',
                  'All Indian languages supported',
                  'Basic Biblical guidance',
                  'Community support'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <Check className="w-5 h-5 text-green-500" /> {item}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="w-full py-3 px-6 rounded-full border border-slate-200 dark:border-slate-800 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-center text-slate-900 dark:text-white">
                Start for Free
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="p-8 bg-slate-900 dark:bg-brand-950 rounded-3xl border-2 border-brand-500 relative overflow-hidden flex flex-col h-full shadow-2xl shadow-brand-500/20">
              <div className="absolute top-4 right-4 px-3 py-1 bg-brand-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-full">
                Popular
              </div>
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-2 text-white">Pro Plan</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">₹299</span>
                  <span className="text-slate-400">/month</span>
                </div>
                <p className="text-sm text-slate-400 mt-2">For serious seekers of wisdom</p>
              </div>
              <ul className="space-y-4 mb-8 flex-1 text-white">
                {[
                  '300 messages per day',
                  'Unlimited history storage',
                  'Priority AI response time',
                  'Advanced theological depth',
                  'Personalized spiritual insights'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <Check className="w-5 h-5 text-brand-500 font-bold" /> {item}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="w-full py-3 px-6 rounded-full bg-brand-600 text-white font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/30 text-center">
                Upgrade to Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold tracking-tight">Gamaliel AI</span>
          </div>
          <p className="text-sm text-slate-500">
            © 2026 Gamaliel AI Pastor. Answers verified against trusted Christian theology and Scripture.
          </p>
          <div className="flex gap-6 text-sm font-medium text-slate-500">
            <Link href="#" className="hover:text-brand-600 transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-brand-600 transition-colors">Terms</Link>
            <Link href="#" className="hover:text-brand-600 transition-colors">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
