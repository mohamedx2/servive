"use server";

import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { heirSchema, vaultEntrySchema } from '@/lib/schemas';
import { generateSalt } from '@/lib/crypto/encryption';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate configuration before initializing
const isConfigured =
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== 'your-project-url' &&
    supabaseUrl.startsWith('http');

const getSupabase = async () => {
    if (!isConfigured) {
        console.warn("Supabase is not configured. DAL is disabled.");
        return null;
    }

    return createServerClient(
        supabaseUrl!,
        supabaseAnonKey!,
        {
            cookies: {
                async get(name: string) {
                    const cookieStore = await cookies();
                    return cookieStore.get(name)?.value;
                },
                async set(name: string, value: string, options: any) {
                    const cookieStore = await cookies();
                    try {
                        cookieStore.set(name, value, options);
                    } catch (error) {
                        // Handle server action cookie set limitation if necessary
                    }
                },
                async remove(name: string, options: any) {
                    const cookieStore = await cookies();
                    try {
                        cookieStore.set(name, '', options);
                    } catch (error) {
                        // Handle server action cookie set limitation if necessary
                    }
                },
            },
        }
    );
};

// Profile Actions
export async function getProfile() {
    const supabase = await getSupabase();
    if (!supabase) return null;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (error) {
        console.error('Error fetching profile:', error);
        return null;
    }
    return data;
}

export async function initializeProfile() {
    const supabase = await getSupabase();
    if (!supabase) throw new Error('Supabase client is not initialized');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    // Check if profile exists
    const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (existingProfile) {
        if (!existingProfile.master_salt) {
            const { error } = await supabase
                .from('profiles')
                .update({ master_salt: generateSalt() })
                .eq('id', user.id);
            if (error) throw error;
        }
        return existingProfile;
    }

    // Create new profile
    const { data, error } = await supabase
        .from('profiles')
        .insert([{
            id: user.id,
            email: user.email,
            master_salt: generateSalt()
        }])
        .select()
        .single();

    if (error) {
        console.error('Error initializing profile:', error);
        throw error;
    }
    return data;
}

export async function updateProfile(updates: { heartbeat_interval_days?: number, grace_period_days?: number }) {
    const supabase = await getSupabase();
    if (!supabase) throw new Error('Supabase client is not initialized');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

    if (error) throw error;
}

export async function updateHeartbeat() {
    const supabase = await getSupabase();
    if (!supabase) throw new Error('Supabase client is not initialized');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { error } = await supabase
        .from('profiles')
        .update({ last_heartbeat_at: new Date().toISOString() })
        .eq('id', user.id);

    if (error) throw error;
}

// Heir Actions
export async function getHeirs() {
    const supabase = await getSupabase();
    if (!supabase) return [];
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('heirs')
        .select('*')
        .eq('user_id', user.id);

    if (error) {
        console.error('Error fetching heirs:', error);
        return [];
    }
    return data;
}

export async function createHeir(heir: z.infer<typeof heirSchema>) {
    const supabase = await getSupabase();
    if (!supabase) throw new Error('Supabase client is not initialized');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { data, error } = await supabase
        .from('heirs')
        .insert([{ ...heir, user_id: user.id }])
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function deleteHeir(id: string) {
    const supabase = await getSupabase();
    if (!supabase) throw new Error('Supabase client is not initialized');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { error } = await supabase
        .from('heirs')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) throw error;
}

// Vault Actions
export async function createVaultEntry(entry: z.infer<typeof vaultEntrySchema>) {
    const supabase = await getSupabase();
    if (!supabase) throw new Error('Supabase client is not initialized');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { data, error } = await supabase
        .from('vault_entries')
        .insert([{ ...entry, user_id: user.id }])
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function getVaultEntries() {
    const supabase = await getSupabase();
    if (!supabase) return [];
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('vault_entries')
        .select('*')
        .eq('user_id', user.id);

    if (error) {
        console.error('Error fetching vault entries:', error);
        return [];
    }
    return data;
}
