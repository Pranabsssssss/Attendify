import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import dbConnect from '@/lib/db/connect';
import User from '@/models/User';

export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { subscription } = await req.json();
        if (!subscription) {
            return NextResponse.json({ error: 'Missing subscription' }, { status: 400 });
        }

        await dbConnect();

        await User.findByIdAndUpdate(session.userId, {
            pushSubscription: subscription
        });

        console.log(`✅ Push subscription saved for User ID: ${session.userId} (${session.role})`);
        console.log(`Endpoint: ${subscription.endpoint.substring(0, 50)}...`);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error saving subscription:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
