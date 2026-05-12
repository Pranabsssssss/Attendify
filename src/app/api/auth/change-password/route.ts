import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import User from '@/models/User';
import { getSession } from '@/lib/auth/session';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { otp, newPassword } = body;

        if (!otp || !newPassword) {
            return NextResponse.json({ error: 'OTP and new password are required' }, { status: 400 });
        }

        if (newPassword.length < 6) {
            return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
        }

        await dbConnect();

        // Select OTP fields explicitly as they are excluded by default
        const user = await User.findById(session.userId).select('+otp.code +otp.expiresAt');

        if (!user || !user.otp || !user.otp.code) {
            return NextResponse.json({ error: 'No OTP request found. Please request a new OTP.' }, { status: 400 });
        }

        // Verify OTP
        if (user.otp.code !== otp) {
            return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
        }

        // Check Expiry
        if (user.otp.expiresAt && new Date() > user.otp.expiresAt) {
            return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 400 });
        }

        // Update Password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.lastPasswordResetAt = new Date();

        // Clear OTP
        user.otp = undefined;
        await user.save();

        return NextResponse.json({ success: true, message: 'Password updated successfully' });

    } catch (error) {
        console.error('Password Change Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
