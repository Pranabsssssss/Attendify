import { getStudentStats } from '@/lib/actions/student';
import { GlassCard } from '@/components/ui/glass-card';
import { User, Clock, CheckCircle, XCircle } from 'lucide-react';
import { getStudentAttendanceConfig } from '@/lib/actions/student';
import { AttendanceCalendar } from '@/components/dashboard/AttendanceCalendar';
import { HolidayBanner } from '@/components/dashboard/HolidayBanner';

export default async function StudentDashboard() {
    const stats = await getStudentStats();
    const data = await getStudentAttendanceConfig();

    if (!stats) return <div>Access Denied</div>;

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <HolidayBanner />

            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                    <p className="text-text-secondary">Welcome back, here is your attendance overview.</p>
                </div>
                <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-text-secondary">
                    Academic Year 2025-2026
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <GlassCard className="relative overflow-hidden group transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:border-primary/30">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <CheckCircle size={80} />
                    </div>
                    <p className="text-sm font-medium text-text-secondary">Present</p>
                    <h3 className="text-4xl font-bold text-white mt-2">{stats.present}</h3>
                    <p className="text-xs text-green-400 mt-2">Be More Attentive</p>
                </GlassCard>

                <GlassCard className="relative overflow-hidden group transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:border-yellow-500/30">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Clock size={80} />
                    </div>
                    <p className="text-sm font-medium text-text-secondary">Late</p>
                    <h3 className="text-4xl font-bold text-white mt-2">{stats.late}</h3>
                    <p className="text-xs text-yellow-400 mt-2">Stay Early</p>
                </GlassCard>

                <GlassCard className="relative overflow-hidden group transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:border-red-500/30">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <XCircle size={80} />
                    </div>
                    <p className="text-sm font-medium text-text-secondary">Absent</p>
                    <h3 className="text-4xl font-bold text-white mt-2">{stats.absent}</h3>
                    <p className="text-xs text-red-400 mt-2">Keep it Down</p>
                </GlassCard>

                <GlassCard className="relative overflow-hidden group bg-gradient-to-br from-primary/20 to-primary/5 border-primary/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/20">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <User size={80} />
                    </div>
                    <p className="text-sm font-medium text-primary-light">Attendance Rate</p>
                    <h3 className="text-4xl font-bold text-white mt-2">{stats.percentage}%</h3>
                    <p className="text-xs text-text-muted mt-2">Present / Total Working Days</p>
                </GlassCard>
            </div>

            {/* Calendar Section */}
            <GlassCard>
                <h2 className="text-xl font-bold text-white mb-6">Attendance Calendar</h2>
                <AttendanceCalendar attendance={data.attendance} holidays={data.holidays} startDate={process.env.NEXT_PUBLIC_ATTENDANCE_START_DATE} />
            </GlassCard>

        </div>
    );
}
