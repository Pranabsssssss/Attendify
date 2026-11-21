import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secretKey = process.env.ATTENDANCE_SECURE_KEY;
if (!secretKey || secretKey.length < 32) {
    throw new Error('ATTENDANCE_SECURE_KEY must be set to a random value of at least 32 characters.');
}
const encodedKey = new TextEncoder().encode(secretKey);

export async function createSession(payload: { userId: string; role: string }) {
    const session = await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(encodedKey);

    const cookieStore = await cookies();
    cookieStore.set('session', session, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        path: '/',
        sameSite: 'lax',
    });
}

export interface SessionPayload {
    userId: string;
    role: string;
    // Add other fields if needed, e.g., iat, exp
    [key: string]: any;
}

export async function getSession(): Promise<SessionPayload | null> {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    if (!session) return null;

    try {
        const { payload } = await jwtVerify(session, encodedKey, {
            algorithms: ['HS256'],
        });
        return payload as unknown as SessionPayload;
    } catch (error) {
        console.error('Failed to verify session', error);
        return null;
    }
}

export async function deleteSession() {
    const cookieStore = await cookies();
    cookieStore.delete('session');
}
