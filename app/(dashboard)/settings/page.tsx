"use client";

import { useState, useEffect } from 'react';
import { Settings, Shield, Bell, Clock, Save, Loader2 } from 'lucide-react';
import { getProfile, updateProfile } from '@/lib/dal';

export default function SettingsPage() {
    const [interval, setInterval] = useState(30);
    const [grace, setGrace] = useState(7);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            const profile = await getProfile();
            if (profile) {
                setInterval(profile.heartbeat_interval_days);
                setGrace(profile.grace_period_days);
            }
            setLoading(false);
        };
        fetchProfile();
    }, []);

    const handleSave = async () => {
        setIsSubmitting(true);
        try {
            await updateProfile({
                heartbeat_interval_days: interval,
                grace_period_days: grace
            });
            alert("Settings saved successfully");
        } catch (err) {
            alert("Failed to save settings");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 animate-pulse">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-4" />
            <p className="text-gray-500">Loading your security configuration...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header>
                <h1 className="text-4xl font-extrabold tracking-tight mb-2">Vault Settings</h1>
                <p className="text-gray-400">Configure your security and transmission preferences</p>
            </header>

            <div className="grid grid-cols-1 gap-8">
                {/* Heartbeat Interval */}
                <section className="p-8 rounded-3xl bg-white/[0.02] border border-white/5">
                    <div className="flex items-center gap-3 mb-8">
                        <Clock className="w-6 h-6 text-emerald-500" />
                        <h2 className="text-2xl font-bold">Transmission Trigger</h2>
                    </div>

                    <div className="space-y-6 max-w-lg">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-4 flex justify-between">
                                <span>Heartbeat Interval</span>
                                <span className="text-emerald-500 font-bold">{interval} Days</span>
                            </label>
                            <input
                                type="range"
                                min="7"
                                max="365"
                                value={interval}
                                onChange={(e) => setInterval(parseInt(e.target.value))}
                                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                            />
                            <p className="mt-3 text-xs text-gray-500">How long we wait for your response before starting the grace period.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-4 flex justify-between">
                                <span>Grace Period</span>
                                <span className="text-blue-500 font-bold">{grace} Days</span>
                            </label>
                            <input
                                type="range"
                                min="1"
                                max="30"
                                value={grace}
                                onChange={(e) => setGrace(parseInt(e.target.value))}
                                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                            <p className="mt-3 text-xs text-gray-500">Extra time provided after initial inactivity before heirs are notified.</p>
                        </div>
                    </div>
                </section>

                {/* Notification Settings */}
                <section className="p-8 rounded-3xl bg-white/[0.02] border border-white/5">
                    <div className="flex items-center gap-3 mb-8">
                        <Bell className="w-6 h-6 text-purple-500" />
                        <h2 className="text-2xl font-bold">Notification Channels</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-purple-500" />
                                </div>
                                <div>
                                    <p className="font-bold">Security Alerts</p>
                                    <p className="text-xs text-gray-500">Critical updates about your vault</p>
                                </div>
                            </div>
                            <div className="w-12 h-6 bg-emerald-500 rounded-full flex items-center px-1">
                                <div className="w-4 h-4 bg-white rounded-full translate-x-6" />
                            </div>
                        </div>
                    </div>
                </section>

                <div className="flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-900/20 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        <span>{isSubmitting ? 'Saving...' : 'Save Configuration'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
