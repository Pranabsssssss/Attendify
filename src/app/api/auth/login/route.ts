import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import User from '@/models/User';
import { verifyPassword } from '@/lib/auth/password';
import { createSession } from '@/lib/auth/session';

export async function POST(req: NextRequest) {
    try {
        const { identifier, password } = await req.json();

        if (!identifier || !password) {
            return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
        }

        await dbConnect();

        // Allow login with Student ID OR Email OR Phone Number
        const query = {
            $or: [
                { email: identifier },
                { studentId: identifier },
                { phoneNumber: identifier }
            ]
        };

        // Explicitly select password as it's excluded by default
        const user = await User.findOne(query).select('+password');

        if (!user || !user.password) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const isMatch = await verifyPassword(password, user.password);
        if (!isMatch) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Create Session
        await createSession({ userId: user._id.toString(), role: user.role });

        return NextResponse.json({
            message: 'Login successful',
            user: {
                name: user.name,
                role: user.role,
                studentId: user.studentId,
                email: user.email,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
