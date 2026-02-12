import { createBrowserClient, createServerClient } from '@supabase/auth-helpers-nextjs';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate configuration before initializing
const isConfigured =
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== 'your-project-url' &&
    supabaseUrl.startsWith('http');

// Client-side client
export const supabase = isConfigured
    ? createBrowserClient(supabaseUrl, supabaseAnonKey)
    : null;

if (!supabase) {
    console.warn("Supabase is not configured. Client-side Supabase is disabled.");
}

// Server-side / Admin client (for cron jobs / background tasks)
export const getServiceRoleClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    return createSupabaseClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
};
