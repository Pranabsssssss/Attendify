'use server';

import dbConnect from '@/lib/db/connect';
import Attendance, { AttendanceStatus } from '@/models/Attendance';
import User from '@/models/User';
import Leave, { LeaveStatus } from '@/models/Leave';
import { getSession } from '@/lib/auth/session';

export async function getTeacherDashboardData() {
    const session = await getSession();
    if (!session || session.role !== 'teacher') return null;

    await dbConnect();

    // 1. Get Teacher's Class - Assuming Teacher has classId or we find it differently
    // Wait, User model doesn't explicitly link Teacher -> ClassId field in strict sense of schema provided previously.
    // Schema: "classId: { type: Schema.Types.ObjectId, ref: 'Class' }" -> usually for student.
    // But let's assume if role is Teacher, classId *is* their assigned class, OR we find Class where classTeacher == teacher._id

    // Let's search Class model
    const Class = (await import('@/models/Class')).default;

    // Improved Lookup: Check implicitly assigned class OR explicitly managed class
    // First, get the full user object to see if they have a classId
    const teacher = await User.findById(session.userId);
    console.log('DEBUG: Teacher Lookup', { id: session.userId, found: !!teacher, classId: teacher?.classId });
    if (!teacher) return null;

    let assignedClass = await Class.findOne({ classTeacher: session.userId });
    console.log('DEBUG: Class by TeacherID', assignedClass?._id);

    // Fallback: If not found by teacher assignment, check the classId on the user profile
    if (!assignedClass && teacher.classId) {
        console.log('DEBUG: Using Fallback ClassID', teacher.classId);
        assignedClass = await Class.findById(teacher.classId);
    }

    if (!assignedClass) {
        console.log('DEBUG: No Class Found');
        return null;
    }

    // 2. Fetch Students of that class
    const students = await User.find({ classId: assignedClass._id, role: 'student' }).select('name rfidUid studentId');
    const studentIds = students.map(s => s._id);

    // 3. Stats for Today
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const todaysAttendance = await Attendance.find({
        student: { $in: studentIds },
        date: today
    });

    const totalStudents = students.length;
    const presentCount = todaysAttendance.filter(a => a.status === AttendanceStatus.PRESENT || a.status === AttendanceStatus.LATE).length;
    const lateCount = todaysAttendance.filter(a => a.status === AttendanceStatus.LATE).length;

    // 4. Low Attendance Students (< 75%)
    let lowAttendanceCount = 0;

    // Calculate Total Working Days
    const startDateEnv = process.env.NEXT_PUBLIC_ATTENDANCE_START_DATE || '2025-06-01';
    const start = new Date(startDateEnv);
    const now = new Date();

    // Simple working day calc (excluding Sundays - rough estimate for dashboard speed)
    // For production accuracy, we should query a "SystemConfig" or "SchoolDay" model, but loop is fine for < 100 students
    let totalWorkingDays = 0;
    for (let d = new Date(start); d <= now; d.setDate(d.getDate() + 1)) {
        if (d.getDay() !== 0) totalWorkingDays++;
    }
    if (totalWorkingDays === 0) totalWorkingDays = 1; // Avoid ZeroDiv

    // Aggregate attendance for all students
    const allAttendance = await Attendance.aggregate([
        { $match: { student: { $in: studentIds }, date: { $gte: start } } },
        { $group: { _id: '$student', count: { $sum: 1 } } } // Count present days
    ]);

    // Map counts to students and check percentage
    const attendanceMap = new Map(allAttendance.map(a => [a._id.toString(), a.count]));

    for (const student of students) {
        const presentDays = attendanceMap.get(student._id.toString()) || 0;
        const percentage = (presentDays / totalWorkingDays) * 100;
        if (percentage < 75) {
            lowAttendanceCount++;
        }
    }

    // 5. Pending Leaves (Restored for Leaves Page)
    const pendingLeaves = await Leave.find({
        student: { $in: studentIds },
        status: LeaveStatus.PENDING
    }).populate('student', 'name').sort({ createdAt: -1 });

    // 6. Leave History (Restored for Leaves Page)
    const leaveHistory = await Leave.find({
        student: { $in: studentIds },
        status: { $ne: LeaveStatus.PENDING }
    }).populate('student', 'name').sort({ updatedAt: -1 }).limit(50);

    return {
        className: assignedClass.name + ' ' + assignedClass.section,
        classId: assignedClass._id.toString(),
        totalStudents,
        presentCount,
        lateCount,
        lowAttendanceCount,
        attendanceToday: JSON.parse(JSON.stringify(todaysAttendance)),
        pendingLeaves: JSON.parse(JSON.stringify(pendingLeaves)),
        leaveHistory: JSON.parse(JSON.stringify(leaveHistory)),
        students: JSON.parse(JSON.stringify(students)),
    };
}

export async function markManualAttendance(studentId: string, status: string, date: string) {
    // Implementation for manual marking
    await dbConnect();
    const d = new Date(date);
    d.setUTCHours(0, 0, 0, 0);

    // --- VALIDATION START ---
    // 1. Check Start Date
    const startDateEnv = process.env.NEXT_PUBLIC_ATTENDANCE_START_DATE || '2025-06-01';
    if (d < new Date(startDateEnv)) {
        throw new Error("Cannot mark attendance before start date.");
    }

    // 2. Check Sunday
    const day = d.getDay();
    if (day === 0) throw new Error("Cannot mark attendance on Sunday.");

    // 3. Check Second Saturday
    if (day === 6) {
        const dayOfMonth = d.getDate();
        const weekNum = Math.ceil(dayOfMonth / 7);
        if (weekNum === 2) throw new Error("Cannot mark attendance on Second Saturday.");
    }

    // 4. Check Holiday
    // Dynamic import to avoid circular dep issues in some setups, good practice here
    const Holiday = (await import('@/models/Holiday')).default;
    const isHoliday = await Holiday.findOne({
        startDate: { $lte: d },
        endDate: { $gte: d }
    });
    if (isHoliday) throw new Error(`Cannot mark attendance on Holiday: ${isHoliday.name}`);
    // --- VALIDATION END ---

    await Attendance.findOneAndUpdate(
        { student: studentId, date: d },
        { status, entryTime: new Date() }, // If manual, entry time is now
        { upsert: true, new: true }
    );
    return { success: true };
}

export async function updateLeaveStatus(leaveId: string, status: 'Approved' | 'Rejected', message?: string) {
    const session = await getSession();
    if (!session || session.role !== 'teacher') throw new Error("Unauthorized");

    await dbConnect();

    // 1. Update Leave Status
    const leave = await Leave.findByIdAndUpdate(leaveId, {
        status: status,
        adminUtils: {
            reviewedBy: session.userId,
            message: message || ''
        }
    }, { new: true }).populate('student');

    if (!leave) throw new Error("Leave request not found");

    // 2. Notify Student
    if (leave.student) {
        // Dynamic import to avoid circular dependency if any
        const { sendNotification } = await import('@/lib/push');

        const emoji = status === 'Approved' ? '✅' : '❌';
        await sendNotification(
            leave.student,
            `Leave Request ${status} ${emoji}`,
            `Your leave request for ${new Date(leave.startDate).toLocaleDateString()} has been ${status.toLowerCase()}.${message ? ` Note: ${message}` : ''}`
        );
    }

    // 3. Revalidate
    const { revalidatePath } = await import('next/cache');
    revalidatePath('/dashboard/teacher/leaves');

    return { success: true };
}
