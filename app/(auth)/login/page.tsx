"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Shield, ArrowRight, Lock } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!supabase) {
            setError("Supabase is not configured. Please check your .env.local file.");
            setLoading(false);
            return;
        }

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
            router.push('/vault');
        } catch (err: any) {
            setError(err.message || 'Failed to login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-emerald-900/10 blur-[150px] rounded-full" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-900/10 blur-[150px] rounded-full" />

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-10">
                    <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
                        <Shield className="w-10 h-10 text-emerald-500 transition-transform group-hover:scale-110" />
                        <span className="text-2xl font-bold tracking-tight">Le Gardien</span>
                    </Link>
                    <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
                    <p className="text-gray-400">Secure access to your digital legacy</p>
                </div>

                <div className="bg-white/[0.03] border border-white/10 p-8 rounded-3xl backdrop-blur-xl shadow-2xl">
                    {!supabase && (
                        <div className="mb-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-400 text-sm flex flex-col gap-2">
                            <p className="font-bold flex items-center gap-2">
                                ⚠️ Configuration Required
                            </p>
                            <p>Please fill in <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in your <code>.env.local</code> file to enable authentication.</p>
                        </div>
                    )}
                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                                placeholder="name@company.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
                            <div className="relative">
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all pl-4"
                                    placeholder="••••••••"
                                />
                                <Lock className="absolute right-4 top-3.5 w-5 h-5 text-gray-500" />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-900/20 transition-all flex items-center justify-center gap-2 group active:scale-[0.98] disabled:opacity-50"
                        >
                            {loading ? 'Authenticating...' : 'Sign In'}
                            {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>

                    <p className="text-center mt-8 text-sm text-gray-400">
                        Don&apos;t have an account?{' '}
                        <Link href="/signup" className="text-emerald-500 hover:underline font-semibold transition-colors">
                            Create Legacy
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
