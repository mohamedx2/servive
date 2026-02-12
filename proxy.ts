import { createServerClient, parse, serialize } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(req: NextRequest) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Validate configuration before initializing
    const isConfigured =
        supabaseUrl &&
        supabaseAnonKey &&
        supabaseUrl !== 'your-project-url' &&
        supabaseUrl.startsWith('http');

    if (!isConfigured) {
        if (process.env.NODE_ENV === 'development') {
            console.warn("Supabase is not configured yet. Middleware is bypassed.");
        }
        return NextResponse.next();
    }

    let res = NextResponse.next({
        request: {
            headers: req.headers,
        },
    });

    const supabase = createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
            cookies: {
                get(name: string) {
                    return req.cookies.get(name)?.value;
                },
                set(name: string, value: string, options: any) {
                    req.cookies.set({
                        name,
                        value,
                        ...options,
                    });
                    res = NextResponse.next({
                        request: {
                            headers: req.headers,
                        },
                    });
                    res.cookies.set({
                        name,
                        value,
                        ...options,
                    });
                },
                remove(name: string, options: any) {
                    req.cookies.set({
                        name,
                        value: '',
                        ...options,
                    });
                    res = NextResponse.next({
                        request: {
                            headers: req.headers,
                        },
                    });
                    res.cookies.set({
                        name,
                        value: '',
                        ...options,
                    });
                },
            },
        }
    );

    const {
        data: { session },
    } = await supabase.auth.getSession();

    const isAuthPage = req.nextUrl.pathname.startsWith('/login') || req.nextUrl.pathname.startsWith('/signup');
    const isDashboardPage =
        req.nextUrl.pathname.startsWith('/vault') ||
        req.nextUrl.pathname.startsWith('/heirs') ||
        req.nextUrl.pathname.startsWith('/settings');

    if (isDashboardPage && !session) {
        return NextResponse.redirect(new URL('/login', req.url));
    }

    if (isAuthPage && session) {
        return NextResponse.redirect(new URL('/vault', req.url));
    }

    return res;
}

export const config = {
    matcher: ['/vault/:path*', '/heirs/:path*', '/settings/:path*', '/login', '/signup'],
};

export default proxy;
