import { getStudentAttendance, getStudentStats } from '@/lib/actions/student';
import { AttendanceCalendar } from '@/components/dashboard/AttendanceCalendar';
import { getHolidays } from '@/lib/actions/student'; // Assuming strict separation, or reuse generic
import { GlassCard } from '@/components/ui/glass-card';

export default async function StudentAttendancePage() {
    const [attendance, stats, holidays] = await Promise.all([
        getStudentAttendance(),
        getStudentStats(),
        getHolidays(),
    ]);

    return (
        <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">My Attendance</h1>
                <p className="text-text-secondary">View your complete attendance history.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <GlassCard className="p-6 hover:scale-[1.02] transition-transform duration-300 hover:shadow-lg hover:shadow-primary/20">
                    <p className="text-sm text-text-muted mb-1">Attendance Rate</p>
                    <p className="text-3xl font-bold text-primary">{stats?.percentage || 0}%</p>
                </GlassCard>
                <GlassCard className="p-6 hover:scale-[1.02] transition-transform duration-300 hover:shadow-lg hover:shadow-green-500/20">
                    <p className="text-sm text-text-muted mb-1">Total Present</p>
                    <p className="text-3xl font-bold text-green-400">{stats?.present || 0}</p>
                </GlassCard>
                <GlassCard className="p-6 hover:scale-[1.02] transition-transform duration-300 hover:shadow-lg hover:shadow-red-500/20">
                    <p className="text-sm text-text-muted mb-1">Total Absent</p>
                    <p className="text-3xl font-bold text-red-400">{stats?.absent || 0}</p>
                </GlassCard>
                <GlassCard className="p-6 hover:scale-[1.02] transition-transform duration-300 hover:shadow-lg hover:shadow-yellow-500/20">
                    <p className="text-sm text-text-muted mb-1">Late Arrivals</p>
                    <p className="text-3xl font-bold text-yellow-400">{stats?.late || 0}</p>
                </GlassCard>
            </div>

            <GlassCard className="p-8 hover:border-primary/30 transition-colors duration-500">
                <AttendanceCalendar attendance={attendance} holidays={holidays} />
            </GlassCard>
        </div>
    );
}
