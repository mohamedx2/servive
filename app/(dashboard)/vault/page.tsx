"use client";

import { useState, useEffect } from 'react';
import { Plus, Lock, Key, FileText, ChevronRight, Search, X, Loader2 } from 'lucide-react';
import { getVaultEntries, createVaultEntry, getProfile, initializeProfile } from '@/lib/dal';
import { deriveKey, encryptData, decryptData } from '@/lib/crypto/encryption';

export default function VaultPage() {
    const [entries, setEntries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [profile, setProfile] = useState<any>(null);

    const [error, setError] = useState<string | null>(null);

    // Form states
    const [vaultTitle, setVaultTitle] = useState('');
    const [vaultContent, setVaultContent] = useState('');
    const [vaultCategory, setVaultCategory] = useState<'message' | 'key' | 'document'>('message');
    const [vaultPassword, setVaultPassword] = useState('');
    const [vaultIsSubmitting, setVaultIsSubmitting] = useState(false);

    // View Entry states
    const [selectedEntry, setSelectedEntry] = useState<any | null>(null);
    const [viewPassword, setViewPassword] = useState('');
    const [decryptedContent, setDecryptedContent] = useState<string | null>(null);
    const [isDecrypting, setIsDecrypting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Try initialization (includes get/create)
                const profileData = await initializeProfile();
                setProfile(profileData);

                const entriesData = await getVaultEntries();
                setEntries(entriesData);
            } catch (err: any) {
                console.error("Initialization failed:", err);
                setError("Failed to initialize vault. Please try refreshing.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleCreateEntry = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile?.master_salt) {
            setError("Vault configuration error (salt missing)");
            return;
        }

        setVaultIsSubmitting(true);
        setError(null);

        try {
            // 1. Derive encryption key client-side
            const encryptionKey = deriveKey(vaultPassword, profile.master_salt);

            // 2. Encrypt the content
            const encryptedContent = encryptData(vaultContent, encryptionKey);

            // 3. Send to server
            await createVaultEntry({
                title: vaultTitle,
                encrypted_content: encryptedContent,
                category: vaultCategory,
            });

            // 4. Refresh & Close
            const updatedEntries = await getVaultEntries();
            setEntries(updatedEntries);
            setIsModalOpen(false);
            resetForm();
        } catch (err: any) {
            setError(err.message || "Failed to create entry");
        } finally {
            setVaultIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setVaultTitle('');
        setVaultContent('');
        setVaultPassword('');
        setError(null);
    };

    const handleDecryptEntry = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedEntry || !profile?.master_salt) return;

        setIsDecrypting(true);
        setError(null);

        try {
            const key = deriveKey(viewPassword, profile.master_salt);
            const decrypted = decryptData(selectedEntry.encrypted_content, key);
            if (!decrypted) throw new Error("Incorrect password");
            setDecryptedContent(decrypted);
        } catch (err) {
            setError("Decryption failed. Incorrect password?");
        } finally {
            setIsDecrypting(false);
        }
    };

    const closeViewModal = () => {
        setSelectedEntry(null);
        setViewPassword('');
        setDecryptedContent(null);
        setError(null);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight mb-2">The Vault</h1>
                    <p className="text-gray-400">Securely store your messages and encryption keys</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-900/20 transition-all active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    <span>New Entry</span>
                </button>
            </header>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-lg bg-[#0d0d0d] border border-white/10 rounded-3xl p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold">New Vault Entry</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateEntry} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Entry Title</label>
                                <input
                                    required
                                    value={vaultTitle}
                                    onChange={(e) => setVaultTitle(e.target.value)}
                                    className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                    placeholder="e.g. My Recovery Phrase"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Category</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {(['message', 'key', 'document'] as const).map((cat) => (
                                        <button
                                            key={cat}
                                            type="button"
                                            onClick={() => setVaultCategory(cat)}
                                            className={`py-2 rounded-xl text-sm font-semibold capitalize border transition-all ${vaultCategory === cat
                                                ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500'
                                                : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'
                                                }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Secret Content</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={vaultContent}
                                    onChange={(e) => setVaultContent(e.target.value)}
                                    className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                    placeholder="The sensitive data to encrypt..."
                                />
                            </div>

                            <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                                <label className="block text-sm font-medium text-emerald-500 mb-2 flex items-center gap-2">
                                    <Key className="w-4 h-4" />
                                    Encryption Password
                                </label>
                                <input
                                    type="password"
                                    required
                                    value={vaultPassword}
                                    onChange={(e) => setVaultPassword(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                    placeholder="Required to decrypt this entry later"
                                />
                                <p className="text-[10px] text-gray-500 mt-2">
                                    Warning: We never store this password. If you lose it, this entry is lost forever.
                                </p>
                            </div>

                            {error && <p className="text-red-400 text-sm">{error}</p>}

                            <button
                                disabled={vaultIsSubmitting}
                                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/20 active:scale-[0.98]"
                            >
                                {vaultIsSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
                                <span>{vaultIsSubmitting ? 'Encrypting & Saving...' : 'Secure in Vault'}</span>
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* View/Decrypt Modal */}
            {selectedEntry && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-lg bg-[#0d0d0d] border border-white/10 rounded-3xl p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto font-sans">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                    <Lock className="w-5 h-5 text-emerald-500" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">{selectedEntry.title}</h2>
                                    <p className="text-xs text-gray-500">Stored on {new Date(selectedEntry.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <button onClick={closeViewModal} className="text-gray-500 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {!decryptedContent ? (
                            <form onSubmit={handleDecryptEntry} className="space-y-6">
                                <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                                    <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                                        This entry is encrypted with military-grade AES-256. To view the contents, please enter the password you used to secure it.
                                    </p>
                                    <div className="relative">
                                        <input
                                            type="password"
                                            required
                                            autoFocus
                                            value={viewPassword}
                                            onChange={(e) => setViewPassword(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 pr-10"
                                            placeholder="Enter decryption password..."
                                        />
                                        <Key className="absolute right-3 top-3.5 w-5 h-5 text-gray-600" />
                                    </div>
                                </div>

                                {error && <p className="text-red-400 text-sm">{error}</p>}

                                <button
                                    disabled={isDecrypting}
                                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/20"
                                >
                                    {isDecrypting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                                    <span>{isDecrypting ? 'Decrypting...' : 'Decrypt Secret'}</span>
                                </button>
                            </form>
                        ) : (
                            <div className="space-y-6 animate-in zoom-in-95 duration-200">
                                <div className="p-6 bg-white/[0.03] border border-white/10 rounded-2xl">
                                    <label className="block text-xs font-bold text-emerald-500 uppercase tracking-widest mb-3">Decrypted Message</label>
                                    <div className="text-white whitespace-pre-wrap leading-relaxed font-mono text-sm bg-black/20 p-4 rounded-xl border border-white/5">
                                        {decryptedContent}
                                    </div>
                                </div>
                                <button
                                    onClick={closeViewModal}
                                    className="w-full py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-all"
                                >
                                    Done
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Search & Filters */}
            <div className="relative">
                <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                <input
                    type="text"
                    placeholder="Search vault..."
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-12 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all font-medium"
                />
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-32 rounded-3xl bg-white/[0.01] border border-white/5 animate-pulse" />
                    ))}
                </div>
            ) : entries.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-20 rounded-3xl border-2 border-dashed border-white/5 bg-white/[0.01]">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
                        <Lock className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Vault is Empty</h3>
                    <p className="text-gray-400 text-center max-w-sm mb-8">
                        Start by adding your first encrypted message or secret key to protect your legacy.
                    </p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-100 transition-all"
                    >
                        Add Your First Entry
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {entries.map((entry) => (
                        <div
                            key={entry.id}
                            onClick={() => setSelectedEntry(entry)}
                            className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-emerald-500/30 transition-all group cursor-pointer hover:bg-white/[0.03]"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-emerald-500/10 transition-colors">
                                    {entry.category === 'key' ? <Key className="w-6 h-6 text-emerald-500" /> : <FileText className="w-6 h-6 text-emerald-500" />}
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-emerald-500 transition-colors" />
                            </div>
                            <h3 className="text-xl font-bold mb-1">{entry.title}</h3>
                            <p className="text-sm text-gray-500">Encrypted on {new Date(entry.created_at).toLocaleDateString()}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
