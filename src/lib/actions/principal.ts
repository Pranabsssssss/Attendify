'use server';

import dbConnect from '@/lib/db/connect';
import Attendance, { AttendanceStatus } from '@/models/Attendance';
import User from '@/models/User';
import Class from '@/models/Class';
import Holiday from '@/models/Holiday';
import { getSession } from '@/lib/auth/session';

export async function getPrincipalDashboardData() {
    const session = await getSession();
    if (!session || session.role !== 'principal') return null;

    await dbConnect();

    // 1. Total Stats
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalTeachers = await User.countDocuments({ role: 'teacher' });

    // 2. Today's Overview
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const todaysAttendance = await Attendance.find({ date: today });

    const presentToday = todaysAttendance.filter(a => a.status === AttendanceStatus.PRESENT || a.status === AttendanceStatus.LATE).length;
    const lateToday = todaysAttendance.filter(a => a.status === AttendanceStatus.LATE).length;
    const absentToday = todaysAttendance.filter(a => a.status === AttendanceStatus.ABSENT).length; // Explicit absents
    // Implicit absents (didn't punch in) = Total Students - Present - Explicit Absent/Holiday/Leave

    const attendanceRate = totalStudents > 0 ? ((presentToday / totalStudents) * 100).toFixed(1) : '0';

    // 3. Class Performance (Expensive aggregation, simplified here)
    // Get all classes
    const classes = await Class.find({}).lean();

    // For each class, calculate attendance % today
    // Ideally use MongoDB Aggregate $lookup

    const classPerformance = await Promise.all(classes.map(async (cls: any) => {
        const studentsInClass = await User.countDocuments({ classId: cls._id, role: 'student' });
        if (studentsInClass === 0) return { ...cls, percentage: 0 };

        const studentIds = (await User.find({ classId: cls._id }).select('_id')).map(s => s._id);
        const totalPresent = await Attendance.countDocuments({
            student: { $in: studentIds },
            date: today,
            status: { $in: [AttendanceStatus.PRESENT, AttendanceStatus.LATE] }
        });

        const totalLate = await Attendance.countDocuments({
            student: { $in: studentIds },
            date: today,
            status: AttendanceStatus.LATE
        });

        // Absent = Total Students - Total Present (Present includes Late)
        // This accounts for both explicit ABSENT records and students who haven't punched in yet.
        const totalAbsent = studentsInClass - totalPresent;

        return {
            id: cls._id.toString(),
            name: `${cls.name}-${cls.section}`,
            percentage: ((totalPresent / studentsInClass) * 100).toFixed(0),
            latePercentage: ((totalLate / studentsInClass) * 100).toFixed(0),
            absentPercentage: ((totalAbsent / studentsInClass) * 100).toFixed(0),
            total: studentsInClass,
            presentCount: totalPresent,
            lateCount: totalLate,
            absentCount: totalAbsent
        };
    }));

    // Sort by Best/Worst
    classPerformance.sort((a, b) => Number(b.percentage) - Number(a.percentage));

    const bestClass = classPerformance[0] || null;
    const worstClass = classPerformance[classPerformance.length - 1] || null;

    return {
        totalStudents,
        totalTeachers,
        presentToday,
        lateToday,
        attendanceRate,
        classPerformance,
        bestClass,
        worstClass
    }
}

export async function getAllClasses() {
    const session = await getSession();
    if (!session || (session.role !== 'principal' && session.role !== 'teacher')) return [];
    await dbConnect();
    const classes = await Class.find({}).sort({ name: 1, section: 1 });
    return JSON.parse(JSON.stringify(classes));
}

export async function getClassMonthlyAttendance(classId: string, month: number, year: number) {
    const session = await getSession();
    if (!session || (session.role !== 'principal' && session.role !== 'teacher')) return null;

    await dbConnect();

    // 1. Get Students
    const students = await User.find({ classId, role: 'student' })
        .select('name studentId _id')
        .sort({ name: 1 });

    if (!students || students.length === 0) {
        return { students: [], attendanceData: {}, holidays: {} };
    }

    // 2. Date Range
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59);

    // 3. Get Attendance
    const attendanceRecords = await Attendance.find({
        student: { $in: students.map(s => s._id) },
        date: { $gte: startDate, $lte: endDate }
    });

    // 4. Transform Data
    const attendanceData: Record<string, Record<number, { status: string; entryTime?: string | null }>> = {};

    attendanceRecords.forEach((record: any) => {
        const sId = record.student.toString();
        const day = new Date(record.date).getDate();

        if (!attendanceData[sId]) attendanceData[sId] = {};
        attendanceData[sId][day] = {
            status: record.status,
            entryTime: record.entryTime ? new Date(record.entryTime).toISOString() : null
        };
    });

    // 5. Get Leaves (Approved)
    const { LeaveStatus } = await import('@/models/Leave');
    const Leave = (await import('@/models/Leave')).default;

    const leaveRecords = await Leave.find({
        student: { $in: students.map(s => s._id) },
        status: LeaveStatus.APPROVED,
        $or: [
            { startDate: { $gte: startDate, $lte: endDate } },
            { endDate: { $gte: startDate, $lte: endDate } },
            { startDate: { $lte: startDate }, endDate: { $gte: endDate } } // Spanning entire month
        ]
    });

    leaveRecords.forEach((leave: any) => {
        const sId = leave.student.toString();
        if (!attendanceData[sId]) attendanceData[sId] = {};

        // Loop through leave days
        let d = new Date(leave.startDate);
        const end = new Date(leave.endDate);

        while (d <= end) {
            if (d.getMonth() === month && d.getFullYear() === year) {
                const day = d.getDate();
                // Priority: Holiday > Leave > Attendance (though usually mutually exclusive)
                // If specific attendance exists (e.g. they came anyway), keep it? 
                // Or Leave overrides? Let's say Leave overrides empty, but if marked Present, keep Present.
                if (!attendanceData[sId][day]) {
                    attendanceData[sId][day] = { status: 'Leave', entryTime: null };
                }
            }
            d.setDate(d.getDate() + 1);
        }
    });

    // 6. Get Holidays
    const holidayRecords = await Holiday.find({
        $or: [
            { startDate: { $gte: startDate, $lte: endDate } },
            { endDate: { $gte: startDate, $lte: endDate } },
            { startDate: { $lte: startDate }, endDate: { $gte: endDate } }
        ]
    });

    const holidays: Record<number, string> = {};
    holidayRecords.forEach((h: any) => {
        let current = new Date(h.startDate);
        const end = new Date(h.endDate);

        // Ensure we only loop relevant days to avoid infinite/long loops if bad data
        // Clamp current/end to the month start/end for efficiency?
        // Actually simple loop is fine unless holiday is 100 years.

        while (current <= end) {
            if (current.getMonth() === month && current.getFullYear() === year) {
                const day = current.getDate();
                holidays[day] = h.name;
            }
            current.setDate(current.getDate() + 1);
        }
    });

    return {
        students: JSON.parse(JSON.stringify(students)),
        attendanceData,
        holidays
    };
}
