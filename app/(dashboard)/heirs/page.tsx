"use client";

import { useState, useEffect } from 'react';
import { UserPlus, Mail, Users, Trash2, Send, X, Loader2 } from 'lucide-react';
import { getHeirs, createHeir, deleteHeir } from '@/lib/dal';

export default function HeirsPage() {
    const [heirs, setHeirs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form states
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchHeirs();
    }, []);

    const fetchHeirs = async () => {
        setLoading(true);
        const data = await getHeirs();
        setHeirs(data);
        setLoading(false);
    };

    const handleAddHeir = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            await createHeir({ name, email });
            await fetchHeirs();
            setIsModalOpen(false);
            setName('');
            setEmail('');
        } catch (err: any) {
            setError(err.message || "Failed to add heir");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteHeir = async (id: string) => {
        if (!confirm("Are you sure you want to remove this heir?")) return;
        try {
            await deleteHeir(id);
            await fetchHeirs();
        } catch (err) {
            alert("Failed to delete heir");
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight mb-2">The Heirs</h1>
                    <p className="text-gray-400">Designate trusted people to receive your legacy</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-2xl hover:bg-gray-100 transition-all active:scale-95"
                >
                    <UserPlus className="w-5 h-5" />
                    <span>Add Heir</span>
                </button>
            </header>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-md bg-[#0d0d0d] border border-white/10 rounded-3xl p-8 shadow-2xl relative">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold">Add New Heir</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleAddHeir} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
                                <input
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                />
                            </div>

                            {error && <p className="text-red-400 text-sm">{error}</p>}

                            <button
                                disabled={isSubmitting}
                                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all"
                            >
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
                                <span>{isSubmitting ? 'Adding...' : 'Add Heir'}</span>
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2].map(i => <div key={i} className="h-24 rounded-3xl bg-white/[0.01] border border-white/5 animate-pulse" />)}
                    </div>
                ) : heirs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-20 rounded-3xl border-2 border-dashed border-white/5 bg-white/[0.01]">
                        <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-6">
                            <Users className="w-8 h-8 text-blue-500" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">No Heirs Designated</h3>
                        <p className="text-gray-400 text-center max-w-sm mb-8">
                            Your legacy is currently safe with you. Add your first heir to ensure it reaches the right hands in the future.
                        </p>
                    </div>
                ) : (
                    heirs.map((heir) => (
                        <div
                            key={heir.id}
                            className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center justify-between group hover:bg-white/[0.04] transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                    <span className="text-lg font-bold text-emerald-500">{heir.name.charAt(0)}</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{heir.name}</h3>
                                    <p className="text-gray-500 flex items-center gap-1.5 text-sm">
                                        <Mail className="w-3.5 h-3.5" />
                                        {heir.email}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleDeleteHeir(heir.id)}
                                    className="p-3 rounded-xl bg-white/5 hover:bg-red-500/10 hover:text-red-500 transition-all"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Security Note */}
            <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/10 flex gap-4">
                <Mail className="w-6 h-6 text-blue-400 mt-1 shrink-0" />
                <div>
                    <h4 className="font-bold text-blue-400 mb-1">Transmission Notice</h4>
                    <p className="text-gray-400 text-sm leading-relaxed">
                        Heirs will only be contacted when your inactivity trigger and grace period expire. They will receive a secure magic link to verify their identity before accessing the vault.
                    </p>
                </div>
            </div>
        </div>
    );
}
