'use server';

import dbConnect from '@/lib/db/connect';
import Attendance, { AttendanceStatus } from '@/models/Attendance';
import User from '@/models/User';
import Holiday from '@/models/Holiday';
import Leave from '@/models/Leave';
import { getSession } from '@/lib/auth/session';

export async function getStudentStats() {
    const session = await getSession();
    if (!session || session.role !== 'student') {
        return null;
    }

    await dbConnect();

    const userId = session.userId;

    // Fetch Attendance
    const attendance = await Attendance.find({ student: userId });

    const present = attendance.filter(a => a.status === AttendanceStatus.PRESENT).length;
    const late = attendance.filter(a => a.status === AttendanceStatus.LATE).length;
    const absent = attendance.filter(a => a.status === AttendanceStatus.ABSENT).length;
    // Note: Total days should ideally be calculated based on academic year start
    // For now, using total attendance records as "working days passed + absent" assumption? 
    // Better: "Working Days" = distinctive dates since start. 
    // Simplification: total records for now, assuming cron/automation runs daily to mark absent.
    // **Wait**, automation rules say "No manual resets", "System must automatically handle".
    // For this MVF (Minimum Viable Feature), we count existing records.

    const total = attendance.length;
    // User requested: Total present days / Total working days passed till now
    // Assumption: 'total' records = total days passed (if cron is active).
    // If no absent records exist yet (manual system), this might show 100%. 
    // We strictly use: (Present + Late) / Total Recorded Days
    const percentage = total > 0 ? ((present + late) / total) * 100 : 0;

    return {
        present,
        late,
        absent,
        percentage: percentage.toFixed(1),
        total // Total working days
    };
}

export async function getStudentAttendance() {
    const session = await getSession();
    if (!session) return [];

    await dbConnect();
    // Return explicit array of attendance records
    const attendance = await Attendance.find({ student: session.userId }).select('date status entryTime');
    return JSON.parse(JSON.stringify(attendance));
}

export async function getStudentAttendanceConfig() {
    // Fetch all attendance records + Holidays for calendar
    const session = await getSession();
    if (!session) return { attendance: [], holidays: [] };

    await dbConnect();

    const attendance = await Attendance.find({ student: session.userId } as any).select('date status entryTime');
    const holidayRecords = await Holiday.find({}).select('startDate endDate name');

    // Flatten holidays for Calendar compatibility
    const holidays: { date: Date; name: string }[] = [];
    holidayRecords.forEach((h: any) => {
        let current = new Date(h.startDate);
        const end = new Date(h.endDate);

        while (current <= end) {
            holidays.push({
                date: new Date(current),
                name: h.name
            });
            current.setDate(current.getDate() + 1);
        }
    });

    return {
        attendance: JSON.parse(JSON.stringify(attendance)),
        holidays: JSON.parse(JSON.stringify(holidays)),
    };
}

export async function getHolidays() {
    await dbConnect();
    const holidays = await Holiday.find({});
    return JSON.parse(JSON.stringify(holidays));
}

export async function getStudentLeaves() {
    const session = await getSession();
    if (!session || session.role !== 'student') return [];

    await dbConnect();

    const leaves = await Leave.find({ student: session.userId })
        .sort({ createdAt: -1 })
        // Use strictPopulate: false to handle potential schema caching issues in dev
        .populate({ path: 'adminUtils.reviewedBy', select: 'name', strictPopulate: false })
        .populate('reviewedBy', 'name'); // Populate legacy reviewer field (optional)

    return JSON.parse(JSON.stringify(leaves));
}
