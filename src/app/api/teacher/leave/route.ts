import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import dbConnect from '@/lib/db/connect';
import Leave, { LeaveStatus } from '@/models/Leave';

export async function PATCH(req: NextRequest) {
    const session = await getSession();
    if (!session || !['teacher', 'principal'].includes(session.role)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { leaveId, status, rejectionReason } = await req.json();

        if (!leaveId || !status || !Object.values(LeaveStatus).includes(status)) {
            return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
        }

        await dbConnect();

        const updatedLeave = await Leave.findByIdAndUpdate(
            leaveId,
            {
                status,
                rejectionReason: status === LeaveStatus.REJECTED ? rejectionReason : undefined,
                reviewedBy: session.userId,
            },
            { new: true }
        );

        if (!updatedLeave) {
            return NextResponse.json({ error: 'Leave not found' }, { status: 404 });
        }

        return NextResponse.json({ message: `Leave ${status}` }, { status: 200 });

    } catch (error) {
        console.error('Leave Update Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
