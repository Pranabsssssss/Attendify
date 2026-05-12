import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import User from '@/models/User';
import Attendance, { AttendanceStatus } from '@/models/Attendance';
import Holiday from '@/models/Holiday';
import { sendNotification } from '@/lib/push';

// Configuration
const LATE_TIME = process.env.LATE_TIME || '08:00:00'; // HH:MM:SS
const SECURE_KEY = process.env.ATTENDANCE_SECURE_KEY;

export async function POST(req: NextRequest) {
    try {
        // 1. Security Check
        const apiKey = req.headers.get('x-api-key');
        if (apiKey !== SECURE_KEY) {
            return NextResponse.json({ error: 'Unauthorized Access' }, { status: 401 });
        }

        const { rfidUid } = await req.json();
        if (!rfidUid) {
            return NextResponse.json({ error: 'RFID UID required' }, { status: 400 });
        }

        await dbConnect();

        // 2. Find User
        const user = await User.findOne({ rfidUid });
        if (!user) {
            return NextResponse.json({
                success: false,
                line1: 'Unregistered',
                line2: 'User'
            }, { status: 200 });
        }

        const studentName = user.name.split(' ')[0].substring(0, 16); // First name, max 16 chars

        // 3. Date & Time Validation (IST)
        // Create date object for current time in UTC, then shift to IST for day comparison
        const now = new Date();

        // Convert to IST string to extract YYYY-MM-DD
        const istDateStr = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Asia/Kolkata',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(now); // "2025-01-28"

        // Construct IST Date object (Midnight)
        const [year, month, day] = istDateStr.split('-').map(Number);
        const todayIST = new Date(Date.UTC(year, month - 1, day, 0, 0, 0)); // UTC Midnight representing IST day start
        // Actually, we should store dates as UTC midnights in DB for consistency or stick to one convention.
        // Let's use the local Midnight construction like in Calendar.
        // Better: Compare YYYY-MM-DD strings.

        const dayOfWeek = new Date(year, month - 1, day).getDay(); // 0 = Sunday

        // 4. Check Non-Working Days
        if (dayOfWeek === 0) {
            return NextResponse.json({ success: false, line1: 'No School', line2: 'Sunday' }, { status: 200 });
        }

        // Second Saturday Check
        if (dayOfWeek === 6) {
            const weekNum = Math.ceil(day / 7);
            if (weekNum === 2) {
                return NextResponse.json({ success: false, line1: 'No School', line2: '2nd Saturday' }, { status: 200 });
            }
        }

        // Holiday Check
        const holiday = await Holiday.findOne({ date: todayIST });
        if (holiday) {
            return NextResponse.json({ success: false, line1: 'Holiday', line2: holiday.name.substring(0, 16) }, { status: 200 });
        }

        // 5. Check Existing Attendance
        const existing = await Attendance.findOne({
            student: user._id,
            date: todayIST
        });

        if (existing) {
            return NextResponse.json({
                success: true,
                line1: `Welcome ${studentName}`,
                line2: 'Already Marked',
                studentName: user.name
            });
        }

        // 6. Determine Status (Late vs Present)
        // Extract current IST Time HH:MM
        const istTimeStr = new Intl.DateTimeFormat('en-GB', {
            timeZone: 'Asia/Kolkata',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }).format(now); // "08:05"

        let status = AttendanceStatus.PRESENT;
        if (istTimeStr > LATE_TIME.substring(0, 5)) {
            status = AttendanceStatus.LATE;
        }

        // 7. Mark Attendance
        const attendance = await Attendance.create({
            student: user._id,
            date: todayIST,
            entryTime: now,
            status: status
        });

        // 8. Send Push Notification (Non-blocking)
        (async () => {
            try {
                const emoji = status === AttendanceStatus.LATE ? '⚠️' : '✅';
                await sendNotification(
                    user,
                    `Attendance Marked ${emoji}`,
                    `Hello ${studentName}, your attendance has been marked ${status} at ${istTimeStr}. Have a great day!`
                );
            } catch (err) {
                console.error("Failed to send RFID push:", err);
            }
        })();

        return NextResponse.json({
            success: true,
            line1: `Welcome ${studentName}`,
            line2: status === AttendanceStatus.LATE ? 'Marked LATE' : 'Marked Present',
            studentName: user.name,
            data: attendance
        });

    } catch (error) {
        console.error('RFID API Error:', error);
        return NextResponse.json({ success: false, line1: 'Attendify', line2: 'Server Error' }, { status: 500 });
    }
}
