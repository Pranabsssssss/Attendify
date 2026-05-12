import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import dbConnect from '@/lib/db/connect';
import Leave, { LeaveStatus } from '@/models/Leave';

export async function POST(req: NextRequest) {
    const session = await getSession();
    if (!session || session.role !== 'student') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { startDate, endDate, reason } = await req.json();

        if (!startDate || !endDate || !reason) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        // --- SERVER VALIDATION ---
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Local time might be tricky on server, relying on UTC/Server time
        // Better: Use a library like `date-fns-tz` if precise timezone (IST) is critical. 
        // For now, using basic Date object. 

        // Fix: Ensure we compare just dates
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);

        if (start < today) {
            return NextResponse.json({ error: 'Cannot apply for leave in the past.' }, { status: 400 });
        }

        if (start.getTime() === today.getTime()) {
            const now = new Date();
            // Get Time Zone Offset - assuming server is in correct zone or use UTC+5:30 logic
            // Ideally convert 'now' to IST before checking.

            const cutoffTime = process.env.NEXT_PUBLIC_LEAVE_CUTOFF_TIME || '08:00';
            const [cutoffHour, cutoffMinute] = cutoffTime.split(':').map(Number);

            const cutoffDate = new Date();
            cutoffDate.setHours(cutoffHour, cutoffMinute, 0, 0);

            if (now > cutoffDate) {
                return NextResponse.json({ error: `Cannot apply for today's leave after ${cutoffTime} AM.` }, { status: 400 });
            }
        }
        // --- END VALIDATION ---

        await dbConnect();

        // 0. Check Pending Limit (Max 2)
        // 0. Check Pending Limit (Max 2)
        const pendingCount = await Leave.countDocuments({
            student: session.userId as any,
            status: LeaveStatus.PENDING
        });

        if (pendingCount >= 2) {
            return NextResponse.json({ error: 'You cannot have more than 2 pending leave requests.' }, { status: 400 });
        }

        // 1. Create Leave
        const newLeave = await Leave.create({
            student: session.userId as any,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            reason,
            status: LeaveStatus.PENDING
        });

        // 2. Notify Class Teacher (Non-blocking)
        (async () => {
            try {
                // Find Student's Class
                const User = (await import('@/models/User')).default;
                const Class = (await import('@/models/Class')).default;
                const { sendNotification } = await import('@/lib/push');

                const student = await User.findById(session.userId);
                if (student?.classId) {
                    const studentClass = await Class.findById(student.classId);
                    if (studentClass?.classTeacher) {
                        const teacher = await User.findById(studentClass.classTeacher);
                        if (teacher) {
                            await sendNotification(
                                teacher,
                                `New Leave Request - ${student.name}`,
                                `Reason: ${reason}`
                            );
                        }
                    }
                }
            } catch (err) {
                console.error("Failed to notify teacher:", err);
            }
        })();

        return NextResponse.json({ message: 'Leave request submitted' }, { status: 201 });

    } catch (error) {
        console.error('Leave Request Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
