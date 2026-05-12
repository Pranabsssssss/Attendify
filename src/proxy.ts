import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secretKey = process.env.ATTENDANCE_SECURE_KEY || 'default_secret_key_change_me';
const encodedKey = new TextEncoder().encode(secretKey);

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Define Public Paths
    // Standard public paths
    if (
        pathname === '/' ||
        pathname === '/login' ||
        pathname === '/register' ||
        pathname.startsWith('/api/') ||
        pathname.startsWith('/_next/') ||
        pathname.startsWith('/static/') ||
        pathname.includes('.') // Any file with extension (favicon.ico, sw.js, etc)
    ) {
        // Continue but check if user is logged in to redirect AWAY from login/landing
        const sessionCookie = request.cookies.get('session');
        if (sessionCookie && (pathname === '/login' || pathname === '/' || pathname === '/register')) {
            try {
                const { payload } = await jwtVerify(sessionCookie.value, encodedKey, {
                    algorithms: ['HS256'],
                });
                // Redirect logged-in user to their dashboard
                return NextResponse.redirect(new URL(`/dashboard/${payload.role}`, request.url));
            } catch (error) {
                // Invalid session, let them stay on public page
            }
        }
        return NextResponse.next();
    }

    // 2. Protected Routes (Everything else, mainly /dashboard)
    const sessionCookie = request.cookies.get('session');

    if (!sessionCookie) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
        const { payload } = await jwtVerify(sessionCookie.value, encodedKey, {
            algorithms: ['HS256'],
        });

        const role = payload.role as string;

        // Strict Role-Based Access Control logic
        if (pathname.startsWith('/dashboard/student') && role !== 'student') {
            return NextResponse.redirect(new URL(`/dashboard/${role}`, request.url));
        }
        if (pathname.startsWith('/dashboard/teacher') && role !== 'teacher') {
            return NextResponse.redirect(new URL(`/dashboard/${role}`, request.url));
        }
        if (pathname.startsWith('/dashboard/principal') && role !== 'principal') {
            return NextResponse.redirect(new URL(`/dashboard/${role}`, request.url));
        }
        if (pathname.startsWith('/dashboard/it_admin') && role !== 'it_admin') {
            return NextResponse.redirect(new URL(`/dashboard/${role}`, request.url));
        }

        return NextResponse.next();
    } catch (error) {
        // Session invalid
        return NextResponse.redirect(new URL('/login', request.url));
    }
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
