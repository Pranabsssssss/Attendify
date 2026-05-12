import { getTeacherDashboardData, markManualAttendance } from '@/lib/actions/teacher';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertTriangle, CalendarOff } from 'lucide-react';
import dbConnect from '@/lib/db/connect';
import Holiday from '@/models/Holiday';

export default async function MarkAttendancePage() {
    const data = await getTeacherDashboardData();
    if (!data) return <div>Loading...</div>;

    // --- HOLIDAY CHECK LOGIC ---
    await dbConnect();
    const now = new Date();
    // Use proper timezone handling if needed, relying on server time for now (or consistent UTC)
    // Construct local YYYY-MM-DD for comparison
    const todayStr = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }); // YYYY-MM-DD
    const [year, month, day] = todayStr.split('-').map(Number);
    const todayDate = new Date(year, month - 1, day); // Midnight Local

    let isHoliday = false;
    let holidayReason = '';

    // 1. Sunday Check
    if (todayDate.getDay() === 0) {
        isHoliday = true;
        holidayReason = 'Sunday (Non-working day)';
    }

    // 2. Second Saturday Check
    if (todayDate.getDay() === 6) {
        const weekNum = Math.ceil(day / 7);
        if (weekNum === 2) {
            isHoliday = true;
            holidayReason = 'Second Saturday (Holiday)';
        }
    }

    // 3. Database Holiday Check
    if (!isHoliday) {
        // Find holiday where date matches today (ignoring time if stored as midnight)
        // We generally store holidays as UTC midnight.
        // Let's match by range or string if possible.
        // Robust way:
        const startOfDay = new Date(todayDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(todayDate);
        endOfDay.setHours(23, 59, 59, 999);

        const dbHoliday = await Holiday.findOne({
            date: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        });

        if (dbHoliday) {
            isHoliday = true;
            holidayReason = `Holiday: ${dbHoliday.name}`;
        }
    }
    // ---------------------------

    // Helper to find status
    const getStatus = (studentId: string) => {
        return data.attendanceToday.find((a: any) => a.student === studentId);
    };

    return (
        <div className="p-8 text-white space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <h1 className="text-3xl font-bold">Mark Attendance</h1>
            <p className="text-text-secondary">Manually mark present students. Unmarked students are considered Absent.</p>

            {isHoliday && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 flex items-center gap-4 animate-pulse">
                    <CalendarOff className="w-10 h-10 text-red-400" />
                    <div>
                        <h3 className="text-lg font-bold text-red-400">Marking Disabled</h3>
                        <p className="text-white/80">Attendance cannot be marked today because it is <strong>{holidayReason}</strong>.</p>
                    </div>
                </div>
            )}

            <GlassCard className="p-6 relative">
                {isHoliday && <div className="absolute inset-0 bg-bg-primary/50 backdrop-blur-[1px] z-10 rounded-xl cursor-not-allowed" />}

                <div className="space-y-4">
                    {data.students.map((student: any) => {
                        const record = getStatus(student._id);
                        return (
                            <div key={student._id} className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5">
                                <div>
                                    <p className="font-bold text-lg">{student.name}</p>
                                    <p className="text-sm text-text-muted">ID: {student.studentId || 'N/A'}</p>
                                </div>
                                <div>
                                    {record ? (
                                        <div className="flex items-center gap-2 text-green-400 bg-green-500/10 px-4 py-2 rounded-lg">
                                            <CheckCircle size={18} />
                                            <span>
                                                {record.status} at {new Date(record.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    ) : (
                                        <form action={async () => {
                                            'use server';
                                            if (isHoliday) return; // double check
                                            await markManualAttendance(student._id, 'Present', new Date().toISOString());
                                        }}>
                                            <Button
                                                size="lg"
                                                disabled={isHoliday}
                                                className="bg-green-600 hover:bg-green-500 text-white font-bold shadow-lg shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Mark Present
                                            </Button>
                                        </form>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </GlassCard>
        </div>
    );
}
