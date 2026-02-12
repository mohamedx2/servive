"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Heart, Users, Mail } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (!supabase) return;

    // Listen for auth changes (including hash fragment being processed)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        router.push('/vault');
      }
    });

    // Initial check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push('/vault');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-emerald-500/30">
      {!supabase && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-500 text-black py-2 px-4 text-center text-sm font-bold flex items-center justify-center gap-2">
          <span>⚠️ Supabase is not configured. Please fill in .env.local and RESTART the dev server.</span>
        </div>
      )}
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-900/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 blur-[120px] rounded-full" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between p-6 max-w-7xl mx-auto backdrop-blur-sm border-b border-white/5">
        <div className="flex items-center gap-2 group cursor-pointer">
          <Shield className="w-8 h-8 text-emerald-500 transition-transform group-hover:scale-110" />
          <span className="text-xl font-bold tracking-tight">Le Gardien de l&apos;Héritage</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">Login</Link>
          <Link href="/signup" className="px-5 py-2.5 text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-lg shadow-emerald-900/20 transition-all hover:scale-105 active:scale-95">
            Protect My Legacy
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center pt-24 pb-12 px-6 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-8 backdrop-blur-md">
          Zero-Knowledge Digital Testament
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
          Your Legacy, <br />
          <span className="text-emerald-500">Secured Forever.</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl leading-relaxed">
          The ultimate digital will application. Store encrypted messages and secret keys that automatically transfer to your heirs if you stop responding.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/signup" className="px-8 py-4 bg-white text-black font-bold rounded-2xl hover:bg-gray-100 transition-all hover:shadow-[0_0_40px_rgba(255,255,255,0.1)]">
            Start Free Protection
          </Link>
          <button className="px-8 py-4 bg-white/5 border border-white/10 font-bold rounded-2xl hover:bg-white/10 transition-all">
            How it works
          </button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 w-full text-left">
          <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-emerald-500/30 transition-colors group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Shield className="w-6 h-6 text-emerald-500" />
            </div>
            <h3 className="text-xl font-bold mb-3">Military-Grade AES</h3>
            <p className="text-gray-400 leading-relaxed">Client-side encryption means only you (and eventually your heirs) can read your data. We never see it.</p>
          </div>

          <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-emerald-500/30 transition-colors group">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Heart className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-xl font-bold mb-3">Heartbeat System</h3>
            <p className="text-gray-400 leading-relaxed">Customizable inactivity triggers. If you go silent, we start a secure grace period before transmission.</p>
          </div>

          <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-emerald-500/30 transition-colors group">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6 text-purple-500" />
            </div>
            <h3 className="text-xl font-bold mb-3">Heir Protection</h3>
            <p className="text-gray-400 leading-relaxed">Seamlessly transfer secret keys, password files, or final messages to the people who matter most.</p>
          </div>
        </div>
      </main>

      <footer className="relative z-10 border-t border-white/5 py-12 px-6 mt-24 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-emerald-500" />
            <span className="font-bold tracking-tight">Le Gardien de l&apos;Héritage</span>
          </div>
          <p className="text-gray-500 text-sm">© 2026 Secured Heritage Protection. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Use</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
