"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Lock, Users, Settings, LogOut, Heart } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();

    const handleSignOut = async () => {
        if (supabase) {
            await supabase.auth.signOut();
        }
        router.push('/');
    };

    const menuItems = [
        { name: 'Vault', href: '/vault', icon: Lock },
        { name: 'Heirs', href: '/heirs', icon: Users },
        { name: 'Settings', href: '/settings', icon: Settings },
    ];

    const handleHeartbeat = async () => {
        try {
            const { updateHeartbeat } = await import('@/lib/dal');
            await updateHeartbeat();
            alert('Heartbeat signaled successfully! Your legacy is safe.');
        } catch (error) {
            console.error('Failed to signal heartbeat:', error);
            alert('Heartbeat failed. Please try again.');
        }
    };

    return (
        <div className="flex min-h-screen bg-[#050505] text-white">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/5 bg-black/20 backdrop-blur-3xl flex flex-col p-6 fixed h-full">
                <Link href="/" className="flex items-center gap-2 mb-10 group">
                    <Shield className="w-8 h-8 text-emerald-500 transition-transform group-hover:scale-110" />
                    <span className="text-xl font-bold tracking-tight">Le Gardien</span>
                </Link>

                <nav className="flex-1 space-y-2">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 ${isActive ? 'text-emerald-500' : 'group-hover:text-white'}`} />
                                <span className="font-medium">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-auto pt-6 border-t border-white/5">
                    <button
                        onClick={handleHeartbeat}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors mb-4 group"
                    >
                        <Heart className="w-5 h-5 group-hover:animate-pulse" />
                        <span className="text-sm font-semibold">Signal Heartbeat</span>
                    </button>

                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-500 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="text-sm font-medium">Safe Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8">
                <div className="max-w-5xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
