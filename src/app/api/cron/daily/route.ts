import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import User from '@/models/User';
import Attendance, { AttendanceStatus } from '@/models/Attendance';
import Holiday from '@/models/Holiday';

export async function GET(req: NextRequest) {
    // Simple security check (replace with CRON_SECRET in production)
    // const authHeader = req.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) { return ... }

    try {
        await dbConnect();

        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        // 1. Check if today is a Holiday or Weekend
        // If so, maybe we don't mark "Absent", but "Holiday" status? 
        // Usually, we just don't run closing logic on holidays, or we pre-fill Holiday status.
        // Let's implement: If today is holiday, ensure all students have "Holiday" status.

        const isHoliday = await Holiday.findOne({ date: today });
        if (isHoliday) {
            // Logic to bulk insert "Holiday" records if not exists
            // For now, let's skip "Absent" marking if holiday
            return NextResponse.json({ message: 'Today is holiday, skipping absent marking' });
        }

        const dayOfWeek = today.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            // Simple weekend check (adjust for 2nd sat if valid)
            return NextResponse.json({ message: 'Weekend, skipping' });
        }

        // 2. Find all students who have NOT marked attendance today
        const students = await User.find({ role: 'student' }).select('_id');
        const studentIds = students.map(s => s._id);

        const attendanceRecords = await Attendance.find({
            date: today,
            student: { $in: studentIds }
        }).select('student');

        const markedStudentIds = new Set(attendanceRecords.map(a => a.student.toString()));

        const absentStudents = studentIds.filter(id => !markedStudentIds.has(id.toString()));

        if (absentStudents.length > 0) {
            const absentDocs = absentStudents.map(id => ({
                student: id,
                date: today,
                status: AttendanceStatus.ABSENT,
                entryTime: null
            }));

            await Attendance.insertMany(absentDocs);
        }

        return NextResponse.json({
            message: 'Daily cron executed',
            absentsMarked: absentStudents.length
        });

    } catch (error) {
        console.error('Cron Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
